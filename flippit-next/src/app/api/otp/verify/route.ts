import { NextResponse } from 'next/server';

const BASE_URL = "https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com";

export async function POST(request: Request) {
  try {
    const { phone, otp } = await request.json();
    
    console.log(`[Proxy] Calling Verify OTP for ${phone} with code ${otp}`);
    const res = await fetch(`${BASE_URL}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });

    const data = await res.json();
    console.log(`[Proxy] Verify OTP Response for ${phone}:`, data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Proxy OTP Verify Error:", error);
    return NextResponse.json({ error: error.message || "Failed to verify OTP" }, { status: 500 });
  }
}
