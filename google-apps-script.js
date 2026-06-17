/**
 * ============================================================
 * Atlas SoftWeb Pvt Ltd — Google Apps Script
 * Internship Form → Google Sheets Integration
 * ============================================================
 *
 * GOOGLE SHEET COLUMN STRUCTURE (Row 1 = Headers):
 * A: Timestamp
 * B: Full Name
 * C: Email
 * D: Phone
 * E: College / University
 * F: Course / Degree
 * G: Internship Program
 * H: Message
 * I: Submitted At (IST)
 *
 * ============================================================
 * SETUP STEPS — Follow exactly:
 * ============================================================
 *
 * STEP 1 — Create the Google Sheet
 * ---------------------------------
 * 1. Go to https://sheets.google.com
 * 2. Create a new spreadsheet
 * 3. Name it: "Atlas SoftWeb - Internship Applications"
 * 4. In Row 1, add these headers exactly:
 *    A1: Timestamp
 *    B1: Full Name
 *    C1: Email
 *    D1: Phone
 *    E1: College / University
 *    F1: Course / Degree
 *    G1: Internship Program
 *    H1: Message
 *    I1: Submitted At (IST)
 * 5. Copy the Sheet ID from the URL:
 *    https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
 *
 * STEP 2 — Open Apps Script
 * --------------------------
 * 1. In your Google Sheet, click:
 *    Extensions → Apps Script
 * 2. Delete all default code in the editor
 * 3. Paste the ENTIRE code below (starting from the line
 *    "// ===== PASTE FROM HERE =====" down to the end)
 * 4. Click Save (Ctrl+S / Cmd+S)
 * 5. Name the project: "Atlas SoftWeb Internship Form"
 *
 * STEP 3 — Deploy as Web App
 * ---------------------------
 * 1. Click "Deploy" → "New deployment"
 * 2. Click the gear icon ⚙ next to "Type"
 * 3. Select "Web app"
 * 4. Set the following:
 *    - Description: Internship Form Handler v1
 *    - Execute as: Me (your Google account)
 *    - Who has access: Anyone
 * 5. Click "Deploy"
 * 6. Grant permissions when prompted (click "Allow")
 * 7. COPY the Web App URL — it looks like:
 *    https://script.google.com/macros/s/XXXXXXXXXX/exec
 *
 * STEP 4 — Update internship-form.js
 * ------------------------------------
 * 1. Open: assets/js/internship-form.js
 * 2. Find line 1 of SCRIPT_URL:
 *    const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
 * 3. Replace with your actual URL:
 *    const SCRIPT_URL = 'https://script.google.com/macros/s/XXXXXX/exec';
 * 4. Save and redeploy to Vercel
 *
 * STEP 5 — Test
 * --------------
 * 1. Open your live site internship page
 * 2. Fill and submit the form
 * 3. Check your Google Sheet — a new row should appear
 * 4. Success modal should show on the website
 *
 * ============================================================
 * REDEPLOYMENT (after any code change):
 * ============================================================
 * If you change the Apps Script code, you MUST create a
 * NEW deployment (not update existing) for changes to take
 * effect. Update the URL in internship-form.js accordingly.
 *
 * ============================================================
 */


// ===== PASTE FROM HERE INTO GOOGLE APPS SCRIPT EDITOR =====

const SHEET_NAME = 'Sheet1'; // Change if your sheet tab has a different name

function doPost(e) {
  try {
    // Parse the incoming JSON body
    const body = JSON.parse(e.postData.contents);

    // Open the active spreadsheet and target sheet
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return buildResponse(false, 'Sheet "' + SHEET_NAME + '" not found. Check SHEET_NAME constant.');
    }

    // Append a new row with all fields
    sheet.appendRow([
      new Date(),                          // A: Timestamp (auto)
      sanitize(body.full_name),            // B: Full Name
      sanitize(body.email),                // C: Email
      sanitize(body.phone),                // D: Phone
      sanitize(body.college),              // E: College
      sanitize(body.course),               // F: Course
      sanitize(body.internship_program),   // G: Internship Program
      sanitize(body.message),              // H: Message
      sanitize(body.submitted_at),         // I: Submitted At (IST from browser)
    ]);

    return buildResponse(true, 'Application saved successfully.');

  } catch (err) {
    return buildResponse(false, 'Server error: ' + err.message);
  }
}

// Allow CORS preflight (OPTIONS) and simple GET health check
function doGet(e) {
  return buildResponse(true, 'Atlas SoftWeb Internship Form endpoint is active.');
}

// ---------- Helpers ----------

function sanitize(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim().substring(0, 1000); // cap length for safety
}

function buildResponse(success, message) {
  const payload = JSON.stringify({
    status:  success ? 'success' : 'error',
    message: message,
  });

  return ContentService
    .createTextOutput(payload)
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== END OF PASTE =====
