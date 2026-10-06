import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs, getDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      phone,
      vehicleNumber,
      societyName,
      district,
      city,
      state,
      notes,
    } = body;

    // Basic validation
    if (!fullName?.trim() || !phone?.trim() || !vehicleNumber?.trim() || !societyName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Full Name, Phone Number, Car Number Plate, and Society Name are required.' },
        { status: 400 }
      );
    }

    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const timestampIST = now.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const leadData = {
      id: leadId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      societyName: societyName.trim(),
      district: (district || '').trim(),
      city: (city || '').trim(),
      state: (state || '').trim(),
      notes: notes || '',
      createdAt: now.toISOString(),
      createdAtIST: timestampIST,
      status: 'new',
      source: 'landing_register_modal',
    };

    // Determine Google Sheets Webhook URL
    let sheetsWebhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL;

    // Check if configured in Firestore settings if not in env
    if (!sheetsWebhookUrl) {
      try {
        const settingsSnap = await getDoc(doc(db, 'System_Settings', 'integrations'));
        if (settingsSnap.exists() && settingsSnap.data()?.googleSheetsWebhookUrl) {
          sheetsWebhookUrl = settingsSnap.data().googleSheetsWebhookUrl;
        }
      } catch (settingsErr) {
        // Continue if settings fetch fails
      }
    }

    let syncedToGoogleSheets = false;
    let sheetsSyncError: string | null = null;

    if (sheetsWebhookUrl) {
      try {
        const sheetsPayload = {
          timestamp: timestampIST,
          fullName: leadData.fullName,
          phone: leadData.phone,
          vehicleNumber: leadData.vehicleNumber,
          societyName: leadData.societyName,
          district: leadData.district,
          city: leadData.city,
          state: leadData.state,
          source: 'Torque Care Landing Page',
        };

        const sheetResponse = await fetch(sheetsWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sheetsPayload),
          redirect: 'follow',
        });

        if (sheetResponse.ok || sheetResponse.status === 302 || sheetResponse.status === 200) {
          syncedToGoogleSheets = true;
        } else {
          sheetsSyncError = `HTTP ${sheetResponse.status}`;
        }
      } catch (sheetErr: any) {
        console.warn('Google Sheets Webhook error:', sheetErr?.message);
        sheetsSyncError = sheetErr?.message || 'Failed to dispatch to Google Sheets';
      }
    }

    // Dual-write: Always record safely into Firestore
    try {
      await setDoc(doc(db, 'Lead_Registrations', leadId), {
        ...leadData,
        syncedToGoogleSheets,
        sheetsSyncError,
        serverCreatedAt: serverTimestamp(),
      });
    } catch (dbErr: any) {
      console.warn('Firestore Lead_Registrations write note:', dbErr);
    }

    try {
      await setDoc(doc(db, 'Car_Owners', leadId), {
        ...leadData,
        name: leadData.fullName,
        phone: leadData.phone,
        vehicleNumber: leadData.vehicleNumber,
        society: leadData.societyName,
        societyName: leadData.societyName,
        district: leadData.district,
        city: leadData.city,
        state: leadData.state,
        isLead: true,
        role: 'lead',
        syncedToGoogleSheets,
        serverCreatedAt: serverTimestamp(),
      });
    } catch (ownerDbErr: any) {
      console.warn('Firestore Car_Owners lead write note:', ownerDbErr);
    }

    return NextResponse.json({
      success: true,
      id: leadId,
      syncedToGoogleSheets,
      hasGoogleSheetsConfigured: Boolean(sheetsWebhookUrl),
      message: 'Thanks for registering with us. We will connect with you shorty',
    });
  } catch (error: any) {
    console.error('Lead registration error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');

    const leadsMap = new Map<string, any>();

    try {
      const snap = await getDocs(collection(db, 'Lead_Registrations'));
      snap.forEach((docSnap) => {
        leadsMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
      });
    } catch (e) {
      // ignore
    }

    try {
      const snapOwners = await getDocs(collection(db, 'Car_Owners'));
      snapOwners.forEach((docSnap) => {
        const d = docSnap.data();
        if (d?.isLead || docSnap.id.startsWith('lead_')) {
          if (!leadsMap.has(docSnap.id)) {
            leadsMap.set(docSnap.id, {
              id: docSnap.id,
              fullName: d.fullName || d.name || 'Interested Customer',
              phone: d.phone || '',
              vehicleNumber: d.vehicleNumber || '',
              societyName: d.societyName || d.society || '',
              district: d.district || '',
              city: d.city || '',
              state: d.state || '',
              createdAt: d.createdAt || '',
              createdAtIST: d.createdAtIST || '',
              status: d.status || 'new',
              syncedToGoogleSheets: d.syncedToGoogleSheets ?? false,
              source: d.source || 'Car_Owners lead',
            });
          }
        }
      });
    } catch (e) {
      // ignore
    }

    const leads = Array.from(leadsMap.values());
    leads.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    if (format === 'csv') {
      const headers = ['Timestamp', 'Full Name', 'Phone', 'Car Plate', 'Society Name', 'District', 'City', 'State', 'Status', 'Google Sheets Synced'];
      const rows = leads.map((l) => [
        `"${(l.createdAtIST || l.createdAt || '').replace(/"/g, '""')}"`,
        `"${(l.fullName || '').replace(/"/g, '""')}"`,
        `"${(l.phone || '').replace(/"/g, '""')}"`,
        `"${(l.vehicleNumber || '').replace(/"/g, '""')}"`,
        `"${(l.societyName || '').replace(/"/g, '""')}"`,
        `"${(l.district || '').replace(/"/g, '""')}"`,
        `"${(l.city || '').replace(/"/g, '""')}"`,
        `"${(l.state || '').replace(/"/g, '""')}"`,
        `"${(l.status || 'new').replace(/"/g, '""')}"`,
        l.syncedToGoogleSheets ? 'Yes' : 'No',
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="torque_care_leads_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to fetch leads' }, { status: 500 });
  }
}
