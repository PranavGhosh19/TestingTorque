import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function GET() {
  try {
    const envUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL || '';
    let storedUrl = '';

    try {
      const snap = await getDoc(doc(db, 'System_Settings', 'integrations'));
      if (snap.exists()) {
        storedUrl = snap.data()?.googleSheetsWebhookUrl || '';
      }
    } catch (e) {
      // ignore
    }

    const activeUrl = envUrl || storedUrl;

    return NextResponse.json({
      configured: Boolean(activeUrl),
      activeUrl: activeUrl ? `${activeUrl.slice(0, 35)}...` : '',
      isFromEnv: Boolean(envUrl),
      isFromDb: Boolean(storedUrl),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { webhookUrl, test } = body;

    if (test && webhookUrl) {
      // Send a test ping to Google Sheets
      const testPayload = {
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        fullName: 'Test Customer',
        phone: '9876543210',
        vehicleNumber: 'KA 01 TC 2026',
        societyName: 'Torque Care HQ Test',
        district: 'Test District',
        city: 'Bengaluru',
        state: 'Karnataka',
        source: 'Google Sheet Connection Test',
      };

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
        redirect: 'follow',
      });

      return NextResponse.json({
        success: res.ok || res.status === 200 || res.status === 302,
        status: res.status,
      });
    }

    if (webhookUrl !== undefined) {
      await setDoc(
        doc(db, 'System_Settings', 'integrations'),
        {
          googleSheetsWebhookUrl: webhookUrl.trim(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return NextResponse.json({ success: true, message: 'Google Sheets Webhook URL updated' });
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
