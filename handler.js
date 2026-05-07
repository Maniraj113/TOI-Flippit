const serverless = require("serverless-http");
const express = require("express");
const { validateSendOtp, validateVerifyOtp, validateNewUser, validateGameLog } = require("./validation");
const { sendOtpSms, generateOtp, verifyJWT } = require("./services");
const { v4 } = require("uuid")
var jwt = require('jsonwebtoken');

const app = express();
const cors = require('cors');

app.use(express.json())
app.use(cors());
const mysql = require('serverless-mysql')();

mysql.config({
  host: process.env.ENDPOINT,
  database: process.env.DATABASE,
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD
})

app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from toi games!",
  });
});

app.post("/send-otp", async (req, res, next) => {
  try {
    if (!validateSendOtp(req)) {
      return res.status(400).json({
        message: "invalid mobile number"
      })
    }

    // CHECK IF AN OTP WAS SENT WITHING LAST 30 MINS
    let prevOtp = await mysql.query("select otp from otp where phone = ? and NOW() < (created_at + INTERVAL 5 MINUTE)", [req.body.phone])
    console.log("🚀 ~ prevOtp:", prevOtp)

    if (prevOtp && prevOtp.length > 0) {
      return res.status(200).json({
        message: "OTP sent"
      })
    }

    // IF NO THEN 
    // SEND OTP SMS 
    const generated_otp = generateOtp()
    try {
      await sendOtpSms(req.body.phone, generated_otp)
    } catch (err) {
      console.log("🚀 ~ err:", err)
      return res.status(500).json({
        message: "failed to send otp"
      })
    }

    // SAVE OTP LOG IN TABLE
    await mysql.query('insert into otp (created_at, phone, otp) values (NOW(), ?, ?)', [req.body.phone, generated_otp])

    return res.status(200).json({
      message: "OTP sent"
    })
  } catch (err) {
    console.log("🚀 ~ err:", err);
    res.status(500).send(err)
  }
});

app.post("/verify-otp", async (req, res) => {
  if (!validateVerifyOtp(req)) {
    return res.status(400).json({ message: "invalid data" });
  }

  const { phone, otp } = req.body || {};

  const verifyRes = await mysql.query(
    'select otp from otp where phone = ? and otp = ? and NOW() < (created_at + INTERVAL 5 MINUTE)',
    [phone, otp]
  );

  if (!verifyRes || verifyRes.length === 0) {
    return res.status(400).json({ OTPVerified: false });
  }

  let [deleteOtp, userData] = await Promise.all([
    mysql.query("delete from otp where phone = ? and otp = ?", [phone, otp]),
    mysql.query("select * from users where phone = ?", [phone])
  ])

  let firstUser = true;
  let uuid = v4();

  if (!userData || userData.length === 0) {
    userData = await mysql.query("insert into users (phone, hash_id, created_at) values (?,?, NOW())", [req.body.phone, uuid])
  } else {
    firstUser = false;
    uuid = userData[0].hash_id
  }

  // CREATE JWT
  var token = jwt.sign({ hash_id: uuid }, process.env.SECRET, { expiresIn: '365d' });


  return res.status(200).json({ OTPVerified: true, FirstTimeUser: firstUser, UserId: uuid, UserName: firstUser ? null : userData[0].user_name, token: token });
});


app.post("/save-user", verifyJWT, async (req, res) => {

  if (!validateNewUser(req)) {
    return res.status(400).json({
      message: "invalid data"
    })
  }


  await mysql.query("update users set user_name = ?, updated_at = NOW() where hash_id = ?", [req.body.user_name, req.token.hash_id])

  return res.status(200).json({ message: "user name updated" });
})

// SAVE GAME LOGS
app.post("/save-game", verifyJWT, async (req, res) => {

  try {
    if (!validateGameLog(req.body)) {
      return res.status(400).json({
        message: "invalid data"
      })
    }
    const body = req.body;

    // CHECK IF GAME EXISTS
    let game_data;
    game_data = await mysql.query('select * from game_log where g_id = ? and user_id = ?', [body.g_id, body.user_id])

    let game_res = "Default Response";
    if (!game_data || !game_data.length) {
      game_data = await mysql.query(`insert into game_log (user_id, g_id, score, time_taken, city, created_at) values(?,?,?,?,?, NOW())`, [body.user_id, body.g_id, body.score, body.time_taken, body.city]);
      game_res = "Game log Pending Added";
    }else if (game_data && game_data.length && body.status == "expired" && game_data[0].status == "pending") {
      result = await mysql.query("update game_log set status= 'expired' where g_id = ? and user_id = ?", [body.g_id, body.user_id])
      game_res = "Game log Expired Updated";
    }else if (game_data && game_data.length && body.status == "completed" && game_data[0].status == "pending") {
      await mysql.query('update game_log set score= ?, time_taken = ?, updated_at = NOW(), status= ? where g_id = ? and user_id = ?', [body.score, body.time_taken, 'completed', body.g_id, body.user_id])
      game_res = "Game log Completed Updated";
    }

    return res.status(200).json({ message: game_res });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "You have already played this game"
    });
  }

})




// TEST APIS DELETE IN PROD
app.get("/get-data", async (req, res) => {
  let [user_data, game_logs] = await Promise.all([
    mysql.query(`select * from users`),
    mysql.query(`select * from game_log`)
  ])

  return res.status(200).json({
    users: user_data,
    game_logs: game_logs
  })
})

// GET USER DATA ALONG WITH HIS GAMES
app.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [userData, gameLogs] = await Promise.all([
      mysql.query("select * from users where hash_id = ?", [userId]),
      mysql.query("select * from game_log where user_id = ?", [userId])
    ]);

    if (!userData || userData.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: userData[0],
      gameLogs: gameLogs
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "path not found",
  });
});

exports.handler = serverless(app);
