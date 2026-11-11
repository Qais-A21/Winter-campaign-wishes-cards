// Google Apps Script — paste into the Apps Script editor of YOUR Google Sheet
// (Extensions > Apps Script), set ADMIN_PASSWORD, then Deploy > New deployment > Web app
// (Execute as: Me, Who has access: Anyone). Copy the Web app URL into config.js.

const ADMIN_PASSWORD = 'CHANGE_ME';   // <- choose your own password
const SHEET_NAME = 'Confirmations';
const MAX_WISH_ID = 1000;

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(SHEET_NAME);
  if (!s) {
    s = ss.insertSheet(SHEET_NAME);
    s.appendRow(['Wish #', 'Confirmed at', 'Collected at']);
    s.setFrozenRows(1);
  }
  return s;
}
function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function findRow_(s, id) {
  const last = s.getLastRow();
  if (last < 2) return -1;
  const ids = s.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) if (Number(ids[i][0]) === id) return i + 2;
  return -1;
}
function iso_(v) { return v ? new Date(v).toISOString() : ''; }

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    const s = sheet_();
    if (d.action === 'confirm') {            // public: donors
      const id = Number(d.id);
      if (!Number.isInteger(id) || id < 1 || id > MAX_WISH_ID) return out_({ ok: false, error: 'bad id' });
      if (findRow_(s, id) === -1) s.appendRow([id, new Date(), '']);
      return out_({ ok: true });
    }
    if (d.password !== ADMIN_PASSWORD) return out_({ ok: false, error: 'auth' });   // everything below: admin only
    if (d.action === 'list') {
      const last = s.getLastRow();
      const rows = last < 2 ? [] : s.getRange(2, 1, last - 1, 3).getValues();
      return out_({ ok: true, items: rows.map(r => ({ id: Number(r[0]), confirmed: iso_(r[1]), collected: iso_(r[2]) })) });
    }
    if (d.action === 'collect' || d.action === 'uncollect') {
      const id = Number(d.id);
      let row = findRow_(s, id);
      if (row === -1) { s.appendRow([id, '', '']); row = s.getLastRow(); }   // collected without a confirmation
      s.getRange(row, 3).setValue(d.action === 'collect' ? new Date() : '');
      return out_({ ok: true });
    }
    return out_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
function doGet() { return out_({ ok: true, info: 'Winter campaign confirmations' }); }
