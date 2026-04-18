import { NextResponse } from 'next/server';

const BASE_URL = "https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com";

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    
    console.log(`[Proxy] Fetching: ${BASE_URL}/send-otp with ${phone}`);
    const res = await fetch(`${BASE_URL}/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    const status = res.status;
    const data = await res.json();
    console.log(`[Proxy] AWS RESPONSE [${status}]:`, JSON.stringify(data, null, 2));
    
    // Check for common AWS gateway issues
    if (status !== 200) {
      console.warn(`[Proxy] ALERT: AWS returned non-200 status for ${phone}. Check AWS SNS/Pinpoint limits.`);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Proxy] CRITICAL ERROR calling send-otp:", error);
    return NextResponse.json({ error: error.message || "Failed to send OTP" }, { status: 500 });
  }
}
