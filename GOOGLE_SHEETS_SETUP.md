# Torque Care — Google Sheets Lead Sync Setup

This setup takes **less than 60 seconds** and allows every interested customer who submits the registration form on the landing page to be automatically saved as a new row in your Google Sheet in real time.

---

### Step 1: Create or Open a Google Sheet
1. Open [sheets.new](https://sheets.new) in your browser (or open your existing Google Sheet).
2. Name the sheet (e.g. `Torque Care — Interested Customers`).

---

### Step 2: Open Apps Script
1. In the Google Sheets top menu bar, click **Extensions** → **Apps Script**.
2. Delete any default code in the editor window (`function myFunction() {...}`).
3. Paste the following script:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Add header row if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp (IST)",
        "Full Name",
        "Phone Number",
        "Car License Plate",
        "Society Name",
        "District",
        "City",
        "State",
        "Source"
      ]);
    }
    
    // Append the customer's registration row
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      data.fullName || '',
      data.phone || '',
      data.vehicleNumber || '',
      data.societyName || '',
      data.district || '',
      data.city || '',
      data.state || '',
      data.source || 'Torque Care Landing Page'
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

### Step 3: Deploy as a Web App
1. In the top right corner of the Apps Script window, click the blue **Deploy** button → **New deployment**.
2. Click the **gear icon (⚙️)** next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description**: `Torque Care Lead Sync`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(Crucial: select Anyone so the form can append rows)*
4. Click **Deploy**.
5. Grant permissions if prompted (click *Advanced* → *Go to Untitled project (unsafe)* → *Allow*).
6. Copy the generated **Web app URL** (it looks like: `https://script.google.com/macros/s/AKfycb.../exec`).

---

### Step 4: Paste into Torque Care
You have two options:
1. **Option A (Instant in Admin Portal)**: Go to `/admin/leads` in the Torque Care dashboard, paste the Web app URL in the Google Sheets box, and click **Save Webhook URL**.
2. **Option B (Environment Variable)**: Add to `.env.local`:
   ```bash
   GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/YOUR_APPS_SCRIPT_ID/exec"
   ```

---

### Verification
- Click **Send Test Row** on the `/admin/leads` page or submit the form on the landing page (`/`).
- Check your Google Sheet: a new row with the lead details will appear instantly!
- In addition, all leads are automatically stored in the secure database and can be exported as `.csv` with 1 click anytime.
