import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { official39Members } from './src/data/membersData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolvePort(): number {
  const args = process.argv.slice(2);
  const portIdx = args.indexOf('--port');
  if (portIdx !== -1 && args[portIdx + 1]) {
    const p = parseInt(args[portIdx + 1], 10);
    if (!isNaN(p) && p > 0 && p !== 8080) return p;
  }
  const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : NaN;
  if (!isNaN(envPort) && envPort !== 8080 && envPort > 0) {
    return envPort;
  }
  return 3000;
}
const PORT = resolvePort();
const app = express();
const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists and seed initial store if missing
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getDefaultCredentials(membersList: any[] = official39Members) {
  const adminCreds = [
    {
      username: 'admin',
      password: 'love4dekko',
      role: 'super_admin',
      fullName: 'Muhammad Iqbal Khattak',
      fullNameUrdu: 'محمد اقبال خٹک',
      phone: '0346-9100998',
      disabled: false,
      createdAt: '2026-10-01'
    },
    {
      username: 'khazanchi',
      password: 'khazanchi2026',
      role: 'finance_secretary',
      fullName: 'Muhammad Iqbal Khattak',
      fullNameUrdu: 'محمد اقبال خٹک',
      phone: '0334-9100998',
      disabled: false,
      createdAt: '2026-10-01'
    }
  ];

  const memberCreds = (membersList || []).map((m: any) => {
    const cleanNum = (m.membershipNumber || m.id || '').toLowerCase().replace(/[\s-]/g, '');
    return {
      username: cleanNum,
      password: `${cleanNum}#2026`,
      role: 'member',
      memberId: m.id,
      fullName: m.fullName,
      fullNameUrdu: m.fullNameUrdu || m.fullName,
      phone: m.phone,
      location: m.address,
      disabled: false,
      createdAt: '2026-10-01'
    };
  });

  return [...adminCreds, ...memberCreds];
}

function getInitialStoreData() {
  return {
    members: official39Members,
    contributions: [],
    claims: [],
    donations: [],
    auditLogs: [],
    notifications: [],
    userCredentials: getDefaultCredentials(official39Members),
    lastSavedServerTime: new Date().toISOString(),
  };
}

if (!fs.existsSync(STORE_FILE)) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(getInitialStoreData(), null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to create initial store:', err);
  }
}

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Helper to read database store
function readStore() {
  if (fs.existsSync(STORE_FILE)) {
    try {
      const content = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
      if (!Array.isArray(content.userCredentials) || content.userCredentials.length === 0) {
        content.userCredentials = getDefaultCredentials(content.members || official39Members);
        writeStore(content);
      }
      return content;
    } catch (err) {
      console.error('Error reading store.json:', err);
    }
  }
  return null;
}

// Helper to write database store
function writeStore(data: any) {
  try {
    const tmpFile = `${STORE_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, STORE_FILE);
    return true;
  } catch (err) {
    console.error('Error writing store.json:', err);
    return false;
  }
}

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    mode: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
  });
});

// GET all stored application data
app.get('/api/data', (_req, res) => {
  const data = readStore();
  if (data) {
    res.json({ success: true, data, source: 'server_disk' });
  } else {
    res.json({ success: false, data: null, message: 'Store not initialized yet' });
  }
});

// POST save application data
app.post('/api/data', (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== 'object') {
    res.status(400).json({ success: false, message: 'Invalid payload' });
    return;
  }

  const existing = readStore() || getInitialStoreData();
  
  // Guard against uninitialized client wiping existing records
  const mergedMembers = Array.isArray(payload.members) && payload.members.length > 0
    ? payload.members
    : existing.members;

  const mergedContributions = Array.isArray(payload.contributions) && payload.contributions.length > 0
    ? payload.contributions
    : (payload.contributions && payload._allowEmpty ? [] : existing.contributions || []);

  const mergedDonations = Array.isArray(payload.donations) && payload.donations.length > 0
    ? payload.donations
    : (payload.donations && payload._allowEmpty ? [] : existing.donations || []);

  const mergedClaims = Array.isArray(payload.claims) && payload.claims.length > 0
    ? payload.claims
    : (payload.claims && payload._allowEmpty ? [] : existing.claims || []);

  const mergedCredentials = Array.isArray(payload.userCredentials) && payload.userCredentials.length > 0
    ? payload.userCredentials
    : existing.userCredentials || getDefaultCredentials(mergedMembers);

  const updated = {
    ...existing,
    ...payload,
    members: mergedMembers,
    contributions: mergedContributions,
    donations: mergedDonations,
    claims: mergedClaims,
    userCredentials: mergedCredentials,
    lastSavedServerTime: new Date().toISOString(),
  };

  const success = writeStore(updated);
  if (success) {
    res.json({ success: true, message: 'Saved to server disk', lastSavedServerTime: updated.lastSavedServerTime, data: updated });
  } else {
    res.status(500).json({ success: false, message: 'Failed to write to disk' });
  }
});

// POST bidirectional sync
app.post('/api/sync', (req, res) => {
  const payload = req.body || {};
  const existing = readStore() || getInitialStoreData();

  // Merge members
  const mergedMembers = Array.isArray(payload.members) && payload.members.length > 0
    ? payload.members
    : existing.members || [];

  // Merge contributions deduplicated by id
  const existingContribs = existing.contributions || [];
  const incomingContribs = Array.isArray(payload.contributions) ? payload.contributions : [];
  const contribMap = new Map();
  for (const c of [...existingContribs, ...incomingContribs]) {
    if (c && c.id) contribMap.set(c.id, c);
  }
  const mergedContributions = Array.from(contribMap.values());

  // Merge userCredentials deduplicated by lowercase username
  const existingCreds = existing.userCredentials || getDefaultCredentials(mergedMembers);
  const incomingCreds = Array.isArray(payload.userCredentials) ? payload.userCredentials : [];
  const credMap = new Map();
  for (const cr of [...existingCreds, ...incomingCreds]) {
    if (cr && cr.username) credMap.set(cr.username.toLowerCase(), cr);
  }
  const mergedCredentials = Array.from(credMap.values());

  const updated = {
    ...existing,
    ...payload,
    members: mergedMembers,
    contributions: mergedContributions,
    userCredentials: mergedCredentials,
    lastSavedServerTime: new Date().toISOString(),
  };

  const success = writeStore(updated);
  if (success) {
    res.json({ success: true, message: 'Successfully synced with server', data: updated });
  } else {
    res.status(500).json({ success: false, message: 'Failed to write sync to disk' });
  }
});

// POST backup snapshot
app.post('/api/backup', (_req, res) => {
  const data = readStore();
  res.json({
    success: true,
    backup: data || {},
    timestamp: new Date().toISOString(),
  });
});

// POST restore snapshot
app.post('/api/restore', (req, res) => {
  const { backup } = req.body;
  if (!backup || typeof backup !== 'object') {
    res.status(400).json({ success: false, message: 'Invalid backup format' });
    return;
  }

  const updated = {
    ...backup,
    restoredAt: new Date().toISOString(),
  };

  const success = writeStore(updated);
  if (success) {
    res.json({ success: true, message: 'Database restored successfully', data: updated });
  } else {
    res.status(500).json({ success: false, message: 'Failed to restore database' });
  }
});

// Receipt proof image upload & serving for WhatsApp screenshot forwarding
const PROOFS_DIR = path.join(DATA_DIR, 'proofs');
if (!fs.existsSync(PROOFS_DIR)) {
  fs.mkdirSync(PROOFS_DIR, { recursive: true });
}

app.post('/api/receipt-proof', (req, res) => {
  try {
    const { imageData, fileName } = req.body || {};
    if (!imageData || typeof imageData !== 'string' || !imageData.startsWith('data:image/')) {
      res.status(400).json({ success: false, message: 'Invalid image data' });
      return;
    }
    const matches = imageData.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!matches) {
      res.status(400).json({ success: false, message: 'Malformed image base64' });
      return;
    }
    const ext = matches[1].toLowerCase().replace('jpeg', 'jpg').replace(/[^a-z0-9]/g, '') || 'png';
    const buffer = Buffer.from(matches[2], 'base64');
    if (buffer.length > 10 * 1024 * 1024) {
      res.status(413).json({ success: false, message: 'Image too large' });
      return;
    }
    const safeName = (typeof fileName === 'string' ? fileName : 'receipt').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 24) || 'receipt';
    const storedName = `proof-${Date.now()}-${safeName}.${ext}`;
    fs.writeFileSync(path.join(PROOFS_DIR, storedName), buffer);
    res.json({ success: true, fileName: storedName, url: `/api/receipt-proof/${storedName}` });
  } catch (err) {
    console.error('Receipt proof upload failed:', err);
    res.status(500).json({ success: false, message: 'Failed to store receipt proof' });
  }
});

app.get('/api/receipt-proof/:filename', (req, res) => {
  const safeFile = path.basename(req.params.filename);
  const fullPath = path.join(PROOFS_DIR, safeFile);
  if (fs.existsSync(fullPath)) {
    res.sendFile(fullPath);
  } else {
    res.status(404).send('Receipt proof not found');
  }
});

// Serve downloads folder
const downloadsDir = path.resolve(__dirname, 'public/downloads');
app.use('/downloads', express.static(downloadsDir, {
  setHeaders: (res, filePath) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-cache');
    if (filePath.endsWith('.apk')) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="Kifaalat-Fund-Offline.apk"');
    } else if (filePath.endsWith('.zip')) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="Kifaalat-Fund-Windows-Portable.zip"');
    }
  }
}));

// Direct download API endpoints
app.get('/api/download/windows', (_req, res) => {
  const winFile = path.join(downloadsDir, 'Kifaalat-Fund-Windows-Portable.zip');
  if (fs.existsSync(winFile)) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="Kifaalat-Fund-Windows-Portable.zip"');
    res.sendFile(winFile);
  } else {
    res.status(404).json({ error: 'Windows portable package not found' });
  }
});

app.get('/api/download/singlefile', (_req, res) => {
  const htmlFile = path.join(downloadsDir, 'Kifaalat-Fund-Standalone-Offline.html');
  if (fs.existsSync(htmlFile)) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="Kifaalat-Fund-Standalone-Offline.html"');
    res.sendFile(htmlFile);
  } else {
    res.status(404).json({ error: 'Single-file offline HTML not found' });
  }
});

app.get('/api/download/android', (_req, res) => {
  const apkFile = path.join(downloadsDir, 'Kifaalat-Fund-Offline.apk');
  if (fs.existsSync(apkFile)) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="Kifaalat-Fund-Offline.apk"');
    res.sendFile(apkFile);
  } else {
    res.status(404).json({ error: 'Android APK package not found' });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite middlewares in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[KMF Server] Running on http://0.0.0.0:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

startServer();
