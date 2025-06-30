const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const SPREADSHEET_ID = '1WDtW90hJuqeaXBitOmXC0Qrwu_N6dtHYMDlbwZjSGuw';
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });
const SHEET_NAME = 'Casas';

function rowToHouse(row) {
  let renovations = [];
  try {
    renovations = row[4] ? JSON.parse(row[4]) : [];
    if (!Array.isArray(renovations)) renovations = [];
  } catch (e) {
    renovations = [];
  }
  return {
    id: row[0],
    address: row[1],
    purchasePrice: Number(row[2]),
    salePrice: row[3] ? Number(row[3]) : null,
    renovations,
    createdAt: row[5],
  };
}
function houseToRow(house) {
  return [
    house.id,
    house.address,
    house.purchasePrice,
    house.salePrice || '',
    JSON.stringify(house.renovations || []),
    house.createdAt,
  ];
}

router.get('/', async (req, res) => {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:F`,
    });
    const rows = result.data.values || [];
    const houses = rows.map(rowToHouse);
    res.json({ success: true, data: houses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { address, purchasePrice, salePrice, renovations } = req.body;
    const newHouse = {
      id: 'house_' + Date.now(),
      address,
      purchasePrice: Number(purchasePrice),
      salePrice: salePrice ? Number(salePrice) : null,
      renovations: renovations || [],
      createdAt: new Date().toISOString(),
    };
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:F2`,
      valueInputOption: 'RAW',
      requestBody: { values: [houseToRow(newHouse)] },
    });
    res.json({ success: true, data: newHouse });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { address, purchasePrice, salePrice, renovations } = req.body;
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:F`,
    });
    const rows = result.data.values || [];
    const idx = rows.findIndex(row => row[0] === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Casa não encontrada' });
    const updatedHouse = {
      id,
      address,
      purchasePrice: Number(purchasePrice),
      salePrice: salePrice ? Number(salePrice) : null,
      renovations: renovations || [],
      createdAt: rows[idx][5],
    };
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${idx + 2}:F${idx + 2}`,
      valueInputOption: 'RAW',
      requestBody: { values: [houseToRow(updatedHouse)] },
    });
    res.json({ success: true, data: updatedHouse });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:F`,
    });
    const rows = result.data.values || [];
    const idx = rows.findIndex(row => row[0] === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Casa não encontrada' });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${idx + 2}:F${idx + 2}`,
      valueInputOption: 'RAW',
      requestBody: { values: [['', '', '', '', '', '']] },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router; 