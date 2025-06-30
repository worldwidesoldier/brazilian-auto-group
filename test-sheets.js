const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SPREADSHEET_ID = '1WDtW90hJuqeaXBitOmXC0Qrwu_N6dtHYMDlbwZjSGuw';
const SHEET_NAME = 'Casas';
const credentials = JSON.parse(fs.readFileSync(path.join(__dirname, 'google-credentials.json')));

async function testRead() {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}`,
    });
    console.log('Leitura bem-sucedida!');
    console.log(result.data.values);
  } catch (err) {
    console.error('Erro ao ler a planilha:', err);
  }
}

async function listSheetNames() {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheetNames = meta.data.sheets.map(s => s.properties.title);
    console.log('Abas encontradas na planilha:', sheetNames);
  } catch (err) {
    console.error('Erro ao listar abas:', err);
  }
}

testRead();
listSheetNames(); 