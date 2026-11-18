import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { ApkSigner, SigningKey } from 'apk_sign_ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');
const downloadsDir = path.join(publicDir, 'downloads');

if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// 1. Build Standalone Single-File HTML App
function buildSingleFileHtml() {
  console.log('--- 1. Building Standalone Single-File HTML App ---');
  const indexHtmlPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('dist/index.html not found. Run npm run build first.');
    return;
  }

  let html = fs.readFileSync(indexHtmlPath, 'utf8');

  // Find linked CSS file in assets
  const cssMatch = html.match(/<link[^>]+href=["'](\.\/assets\/[^"']+\.css)["'][^>]*>/);
  if (cssMatch) {
    const cssRel = cssMatch[1].replace('./', '');
    const cssPath = path.join(distDir, cssRel);
    if (fs.existsSync(cssPath)) {
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      html = html.replace(cssMatch[0], `<style>\n${cssContent}\n</style>`);
      console.log(`Inlined CSS: ${cssRel}`);
    }
  }

  // Find script JS file in assets
  const jsMatch = html.match(/<script[^>]+src=["'](\.\/assets\/[^"']+\.js)["'][^>]*><\/script>/);
  if (jsMatch) {
    const jsRel = jsMatch[1].replace('./', '');
    const jsPath = path.join(distDir, jsRel);
    if (fs.existsSync(jsPath)) {
      const jsContent = fs.readFileSync(jsPath, 'utf8');
      html = html.replace(jsMatch[0], `<script type="module">\n${jsContent}\n</script>`);
      console.log(`Inlined JS: ${jsRel}`);
    }
  }

  // Remove registerSW or external manifest links that aren't needed in standalone single-file mode
  html = html.replace(/<link[^>]+href=["']\.\/manifest\.webmanifest["'][^>]*>/, '');
  html = html.replace(/<script[^>]+src=["']\.\/registerSW\.js["'][^>]*><\/script>/, '');

  const outHtmlPublic = path.join(downloadsDir, 'Kifaalat-Fund-Standalone-Offline.html');
  const outHtmlDist = path.join(distDir, 'downloads', 'Kifaalat-Fund-Standalone-Offline.html');
  fs.mkdirSync(path.dirname(outHtmlDist), { recursive: true });

  fs.writeFileSync(outHtmlPublic, html, 'utf8');
  fs.writeFileSync(outHtmlDist, html, 'utf8');
  console.log(`Single-File Offline HTML created: ${outHtmlPublic} (${fs.statSync(outHtmlPublic).size} bytes)`);
}

// 2. Build Windows Portable ZIP with 100% Windows Explorer compatibility
function buildWindowsZip() {
  console.log('--- 2. Building Windows Portable ZIP ---');
  // Use Python script with create_system=0 (DOS/Windows) and forward-slash normalized relative paths
  const pythonScript = `
import os, sys, zipfile

dist_dir = "${distDir}"
out_zip = "${path.join(downloadsDir, 'Kifaalat-Fund-Windows-Portable.zip')}"

bat_content = """@echo off
title Kifaalat e Miyyat Fund - Portable Desktop App
cd /d "%~dp0"

echo ===================================================
echo   Kifaalat e Miyyat Fund - Portable Desktop App
echo   کفالت میت فنڈ - پورٹیبل ڈیسک ٹاپ سافٹ ویئر
echo ===================================================
echo.
echo Launching offline application window...

if exist "%ProgramFiles(x86)%\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe" (
    start "" "%ProgramFiles(x86)%\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe" --app="file:///%~dp0index.html"
    exit
)
if exist "%ProgramFiles%\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe" (
    start "" "%ProgramFiles%\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe" --app="file:///%~dp0index.html"
    exit
)
if exist "%ProgramFiles%\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe" (
    start "" "%ProgramFiles%\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe" --app="file:///%~dp0index.html"
    exit
)
if exist "%ProgramFiles(x86)%\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe" (
    start "" "%ProgramFiles(x86)%\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe" --app="file:///%~dp0index.html"
    exit
)
if exist "%LocalAppData%\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe" (
    start "" "%LocalAppData%\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe" --app="file:///%~dp0index.html"
    exit
)

start "" "file:///%~dp0index.html"
exit
"""

vbs_content = '''Set WshShell = CreateObject("WScript.Shell")
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

edge1 = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe")
edge2 = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe")
chrome1 = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe")
chrome2 = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe")

Set fso = CreateObject("Scripting.FileSystemObject")
url = "file:///" & Replace(strPath, "\\\\", "/") & "/index.html"

If fso.FileExists(edge1) Then
    WshShell.Run """" & edge1 & """ --app=""" & url & """", 1, False
ElseIf fso.FileExists(edge2) Then
    WshShell.Run """" & edge2 & """ --app=""" & url & """", 1, False
ElseIf fso.FileExists(chrome1) Then
    WshShell.Run """" & chrome1 & """ --app=""" & url & """", 1, False
ElseIf fso.FileExists(chrome2) Then
    WshShell.Run """" & chrome2 & """ --app=""" & url & """", 1, False
Else
    WshShell.Run "explorer.exe """ & url & """", 1, False
End If
'''

readme_content = """=============================================================
  KIFAALAT E MIYYAT FUND - PORTABLE DESKTOP APPLICATION
  کفالت میت فنڈ - پورٹیبل ڈیسک ٹاپ سافٹ ویئر (بغیر انسٹالیشن)
=============================================================

[URDU GUIDE - اردو ہدایات]
1. اس زپ فائل کو اپنے کمپیوٹر یا یو ایس بی (USB Flash Drive) میں Extract (ان زپ) کریں۔
2. چلانے کے لیے 'Kifaalat-Fund.bat' یا بغیر بلیک اسکرین کے 'Kifaalat-Fund-Silent.vbs' پر ڈبل کلک کریں۔
3. یہ سافٹ ویئر بغیر کسی انسٹالیشن اور بغیر انٹرنیٹ کے 100% آف لائن چلتا ہے۔
4. تمام ممبران، فنڈ بیلنس، ادائیگیاں، اور رسیدیں آپ کے کمپیوٹر میں محفوظ رہتی ہیں۔
5. کسی ایڈمنسٹریٹر پرمشن کی ضرورت نہیں ہے۔ یہ ونڈوز 7، 8، 10 اور 11 پر بغیر کسی پابندی کے چلتا ہے۔

[ENGLISH GUIDE]
1. Extract this ZIP file to any folder on your PC or USB flash drive.
2. Double-click 'Kifaalat-Fund.bat' (or 'Kifaalat-Fund-Silent.vbs').
3. Runs immediately in a dedicated desktop window without address bars.
4. Requires NO installation and works 100% offline without internet.
5. Fully compatible with Windows 7, 8, 8.1, 10, and 11 (32-bit & 64-bit).

رابطہ: محمد اقبال خٹک (خزانچی و فنانس سیکرٹری) - 0346-9100998
=============================================================
"""

with zipfile.ZipFile(out_zip, 'w', zipfile.ZIP_DEFLATED) as z:
    def add_entry(name, data):
        info = zipfile.ZipInfo(name)
        info.create_system = 0  # FAT / Windows filesystem
        info.external_attr = 0o644 << 16
        z.writestr(info, data)

    add_entry("Kifaalat-Fund.bat", bat_content.encode('utf-8'))
    add_entry("Kifaalat-Fund-Silent.vbs", vbs_content.encode('utf-8'))
    add_entry("README-WINDOWS.txt", readme_content.encode('utf-8'))

    for root, dirs, files in os.walk(dist_dir):
        for file in files:
            if file.endswith(".zip") or file.endswith(".apk"):
                continue
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, dist_dir).replace("\\\\", "/")
            with open(full_path, 'rb') as f:
                content = f.read()
            add_entry(rel_path, content)

dist_zip = "${path.join(distDir, 'downloads', 'Kifaalat-Fund-Windows-Portable.zip')}"
import shutil
shutil.copy2(out_zip, dist_zip)
print(f"Windows ZIP created: {out_zip} ({os.path.getsize(out_zip)} bytes)")
`;

  fs.writeFileSync('/tmp/make_win_zip.py', pythonScript, 'utf8');
  execSync('python3 /tmp/make_win_zip.py', { stdio: 'inherit' });
}

// 3. Build & Sign Android APK with APK Signature Scheme v1 + v2 + v3
async function buildAndSignAndroidApk() {
  console.log('--- 3. Building & Signing Android APK (v1 + v2 + v3) ---');
  const templateApk = '/tmp/base-template.apk';
  if (!fs.existsSync(templateApk)) {
    console.log('Downloading base APK template...');
    execSync('curl -sL "https://github.com/mikespub-archive/android-webview/releases/download/v1.28/app-release.apk" -o /tmp/base-template.apk');
  }

  const livePortalUrl = 'https://ais-pre-hejejopcpeagtek5zegbu5-422319891547.asia-southeast1.run.app';
  const devPortalUrl = 'https://ais-dev-hejejopcpeagtek5zegbu5-422319891547.asia-southeast1.run.app';

  const settingsJson = JSON.stringify({
    sites: [
      { url: livePortalUrl, title: 'Kifaalat e Miyyat Fund (Live Portal)' },
      { url: 'https://appassets.androidplatform.net/assets/web/index.html', title: 'Kifaalat e Miyyat Fund (Offline)' }
    ],
    other: livePortalUrl,
    match: [
      ['host', 'endsWith', 'asia-southeast1.run.app'],
      ['host', 'endsWith', 'googleapis.com'],
      ['host', 'endsWith', 'firebaseapp.com'],
      ['host', 'endsWith', 'gstatic.com'],
      ['host', 'equals', 'accounts.google.com'],
      ['host', 'equals', 'appassets.androidplatform.net']
    ],
    skip: [
      ['path', 'endsWith', '.apk'],
      ['path', 'endsWith', '.zip']
    ],
    remote_debug: false,
    console_log: false,
    js_interface: false,
    context_menu: true,
    not_matching: false,
    local_sites: true,
    update_zip: '',
    web_settings: {
      JavaScriptEnabled: true,
      DomStorageEnabled: true,
      DatabaseEnabled: true,
      AllowFileAccess: true,
      AllowContentAccess: true
    },
    source: 'assets',
    timestamp: new Date().toISOString()
  }, null, 2);

  const localConfigJson = JSON.stringify({
    sites: {
      '../web/index.html': 'Kifaalat e Miyyat Fund (Offline Mode)'
    },
    bundles: [],
    prefix: 'https://appassets.androidplatform.net/sites/'
  }, null, 2);

  const launcherHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kifaalat e Miyyat Fund</title>
  <style>
    body {
      margin: 0; font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #022c22 0%, #004d30 60%, #065f46 100%);
      color: #ffffff; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .card {
      max-width: 420px; width: 100%; background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.18); border-radius: 24px; padding: 28px 22px; text-align: center;
      box-shadow: 0 20px 50px rgba(0,0,0,0.35);
    }
    h1 { font-size: 20px; margin: 0 0 6px; color: #fde68a; }
    h2 { font-size: 16px; margin: 0 0 14px; font-weight: 600; color: #d1fae5; }
    p { font-size: 13px; color: #ecfdf5; opacity: 0.9; line-height: 1.5; margin: 0 0 18px; }
    .btn {
      display: block; width: 100%; box-sizing: border-box; padding: 14px 16px; margin-bottom: 10px;
      border-radius: 14px; font-size: 14px; font-weight: 700; text-decoration: none; border: none; cursor: pointer;
    }
    .btn-primary { background: #fbbf24; color: #022c22; }
    .btn-secondary { background: rgba(255,255,255,0.16); color: #ffffff; border: 1px solid rgba(255,255,255,0.28); }
    .status { font-size: 12px; color: #a7f3d0; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>کفالتِ میت فنڈ ویلفیئر سوسائٹی</h1>
    <h2>Kifaalat e Miyyat Fund Portal</h2>
    <p id="statusMsg">Connecting to live society portal...<br/>لائیو پورٹل سے رابطہ کیا جا رہا ہے...</p>
    <a class="btn btn-primary" href="${livePortalUrl}">Open Live Society Portal (Online)</a>
    <a class="btn btn-secondary" href="/assets/web/index.html">Open Offline Mode / آف لائن موڈ</a>
    <div class="status">Khazanchi / Admin: 0346-9100998</div>
  </div>
  <script>
    (function() {
      var targetOnline = "${livePortalUrl}";
      var targetOffline = "/assets/web/index.html";
      var done = false;
      function go(url) {
        if (done) return;
        done = true;
        window.location.replace(url);
      }
      if (!navigator.onLine) {
        document.getElementById("statusMsg").innerHTML = "Offline detected — opening local app...";
        setTimeout(function() { go(targetOffline); }, 500);
        return;
      }
      var timer = setTimeout(function() {
        go(targetOffline);
      }, 3500);
      fetch(targetOnline + "/api/health", { mode: "no-cors", cache: "no-store" })
        .then(function() {
          clearTimeout(timer);
          go(targetOnline);
        })
        .catch(function() {
          clearTimeout(timer);
          go(targetOffline);
        });
    })();
  </script>
</body>
</html>`;

  fs.writeFileSync('/tmp/apk-settings.json', settingsJson, 'utf8');
  fs.writeFileSync('/tmp/apk-local-config.json', localConfigJson, 'utf8');
  fs.writeFileSync('/tmp/apk-launcher.html', launcherHtml, 'utf8');

  // Extract base APK, replace assets/web with dist files (excluding downloads/), configure portal launcher
  const prepScript = `
import os, zipfile, shutil, tempfile

template_apk = "/tmp/base-template.apk"
dist_dir = "${distDir}"
unsigned_apk = "/tmp/app-unsigned.apk"

with tempfile.TemporaryDirectory() as temp_dir:
    extracted = os.path.join(temp_dir, "extracted")
    with zipfile.ZipFile(template_apk, 'r') as z:
        z.extractall(extracted)

    web_target = os.path.join(extracted, "assets", "web")
    if os.path.exists(web_target):
        shutil.rmtree(web_target)
    os.makedirs(web_target, exist_ok=True)

    for root, dirs, files in os.walk(dist_dir):
        # Skip nested downloads folder inside dist/ to keep APK lean and valid
        rel_root = os.path.relpath(root, dist_dir)
        if rel_root == "downloads" or rel_root.startswith("downloads" + os.sep):
            continue
        for file in files:
            if file.endswith(".zip") or file.endswith(".apk") or file == "Kifaalat-Fund-Standalone-Offline.html":
                continue
            src = os.path.join(root, file)
            rel = os.path.relpath(src, dist_dir)
            dest = os.path.join(web_target, rel)
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            shutil.copy2(src, dest)

    # Mirror into assets/demo
    demo_target = os.path.join(extracted, "assets", "demo")
    if os.path.exists(demo_target):
        shutil.rmtree(demo_target)
    shutil.copytree(web_target, demo_target)

    # Install custom KMF WebView settings and launcher
    shutil.copy2("/tmp/apk-settings.json", os.path.join(extracted, "assets", "settings.json"))
    shutil.copy2("/tmp/apk-local-config.json", os.path.join(extracted, "assets", "local", "config.json"))
    shutil.copy2("/tmp/apk-launcher.html", os.path.join(extracted, "assets", "local", "index.html"))

    # Remove old META-INF signatures
    meta_inf = os.path.join(extracted, "META-INF")
    if os.path.exists(meta_inf):
        for item in os.listdir(meta_inf):
            if item.endswith(".RSA") or item.endswith(".SF") or item.endswith(".MF"):
                try:
                    os.remove(os.path.join(meta_inf, item))
                except:
                    pass

    # Re-pack unsigned zip (keep resources.arsc uncompressed; ApkSigner.zipalign also enforces 4-byte alignment)
    with zipfile.ZipFile(unsigned_apk, 'w', zipfile.ZIP_DEFLATED) as z_out:
        for root, dirs, files in os.walk(extracted):
            for file in files:
                full = os.path.join(root, file)
                rel = os.path.relpath(full, extracted).replace("\\\\", "/")
                comp = zipfile.ZIP_STORED if rel == "resources.arsc" else zipfile.ZIP_DEFLATED
                z_out.write(full, arcname=rel, compress_type=comp)

print(f"Unsigned APK prepared: {unsigned_apk}")
`;

  fs.writeFileSync('/tmp/prep_apk.py', prepScript, 'utf8');
  execSync('python3 /tmp/prep_apk.py', { stdio: 'inherit' });

  // Generate RSA 2048 key and self-signed certificate for signing
  const keyPath = '/tmp/apk-key.pem';
  const certPath = '/tmp/apk-cert.pem';
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    execSync('openssl req -x509 -newkey rsa:2048 -keyout /tmp/apk-key.pem -out /tmp/apk-cert.pem -days 10000 -nodes -subj "/CN=Kifaalat e Miyyat Fund/O=KMF/C=PK"');
  }

  const privateKey = fs.readFileSync(keyPath, 'utf8');
  const certificate = fs.readFileSync(certPath, 'utf8');

  const signer = new ApkSigner({
    signingKey: SigningKey.fromPEM(privateKey, certificate),
    digestAlgorithm: 'SHA-256'
  });

  const unsignedApkBytes = new Uint8Array(fs.readFileSync('/tmp/app-unsigned.apk'));
  console.log(`Signing APK (${unsignedApkBytes.length} bytes) with v1, v2, and v3 schemes...`);
  const { signedApk } = await signer.sign(unsignedApkBytes);

  const outApkPublic = path.join(downloadsDir, 'Kifaalat-Fund-Offline.apk');
  const outApkDist = path.join(distDir, 'downloads', 'Kifaalat-Fund-Offline.apk');

  fs.writeFileSync(outApkPublic, signedApk);
  fs.writeFileSync(outApkDist, signedApk);

  console.log(`Signed Android APK created: ${outApkPublic} (${signedApk.length} bytes)`);
}

async function main() {
  buildSingleFileHtml();
  buildWindowsZip();
  await buildAndSignAndroidApk();
  console.log('=== All offline packages generated successfully! ===');
}

main().catch(err => {
  console.error('Packaging failed:', err);
  process.exit(1);
});
