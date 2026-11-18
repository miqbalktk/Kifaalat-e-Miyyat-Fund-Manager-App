#!/usr/bin/env python3
import os
import sys
import shutil
import zipfile
import subprocess
import hashlib
import base64
import tempfile

def create_windows_portable():
    print("=== Creating Windows Portable Application Package ===")
    dist_dir = os.path.abspath("dist")
    if not os.path.exists(dist_dir):
        print("dist directory not found. Please run npm run build first.")
        sys.exit(1)
        
    out_dir = os.path.abspath("public/downloads")
    os.makedirs(out_dir, exist_ok=True)
    zip_path = os.path.join(out_dir, "Kifaalat-Fund-Windows-Portable.zip")
    
    bat_content = """@echo off
title Kifaalat e Miyyat Fund - Portable Edition
cd /d "%~dp0"

echo ===================================================
echo   Kifaalat e Miyyat Fund - Portable Desktop App
echo   کفالت میت فنڈ - پورٹیبل ڈیسک ٹاپ سافٹ ویئر
echo ===================================================
echo.
echo Launching offline application window...

:: Check if Microsoft Edge exists (Pre-installed on Win 10 & 11)
if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" --app="file:///%~dp0index.html"
    exit
)
if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" --app="file:///%~dp0index.html"
    exit
)

:: Check if Google Chrome exists
if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" --app="file:///%~dp0index.html"
    exit
)
if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" --app="file:///%~dp0index.html"
    exit
)
if exist "%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" --app="file:///%~dp0index.html"
    exit
)

:: Fallback to system default browser
start "" "file:///%~dp0index.html"
exit
"""

    vbs_content = (
        'Set WshShell = CreateObject("WScript.Shell")\r\n'
        'strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)\r\n'
        'edge1 = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe")\r\n'
        'edge2 = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe")\r\n'
        'chrome1 = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe")\r\n'
        'chrome2 = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe")\r\n'
        'Set fso = CreateObject("Scripting.FileSystemObject")\r\n'
        'url = "file:///" & Replace(strPath, "\\", "/") & "/index.html"\r\n'
        'If fso.FileExists(edge1) Then\r\n'
        '    WshShell.Run """" & edge1 & """ --app=""" & url & """", 1, False\r\n'
        'ElseIf fso.FileExists(edge2) Then\r\n'
        '    WshShell.Run """" & edge2 & """ --app=""" & url & """", 1, False\r\n'
        'ElseIf fso.FileExists(chrome1) Then\r\n'
        '    WshShell.Run """" & chrome1 & """ --app=""" & url & """", 1, False\r\n'
        'ElseIf fso.FileExists(chrome2) Then\r\n'
        '    WshShell.Run """" & chrome2 & """ --app=""" & url & """", 1, False\r\n'
        'Else\r\n'
        '    WshShell.Run "explorer.exe """ & url & """", 1, False\r\n'
        'End If\r\n'
    )

    readme_content = """=============================================================
  KIFAALAT E MIYYAT FUND - PORTABLE DESKTOP APPLICATION
  کفالت میت فنڈ - پورٹیبل ڈیسک ٹاپ سافٹ ویئر (بغیر انسٹالیشن)
=============================================================

[URDU GUIDE - اردو ہدایات]
1. اس زپ فائل کو اپنے کمپیوٹر یا یو ایس بی (USB Flash Drive) میں کسی بھی فولڈر میں Extract (ان زپ) کریں۔
2. سافٹ ویئر چلانے کے لیے 'Kifaalat-Fund.bat' یا 'Kifaalat-Fund-Silent.vbs' پر ڈبل کلک کریں۔
3. یہ سافٹ ویئر بغیر کسی انسٹالیشن اور بغیر انٹرنیٹ کے 100% آف لائن چلتا ہے۔
4. تمام ممبران، فنڈ بیلنس، ادائیگیاں، اور رسیدیں آپ کے کمپیوٹر میں محفوظ رہتی ہیں۔
5. کسی ایڈمنسٹریٹر پرمشن یا رجسٹریشن کی ضرورت نہیں ہے۔ یہ ونڈوز 7، 8، 10 اور 11 پر بغیر کسی پابندی کے چلتا ہے۔

[ENGLISH GUIDE]
1. Extract this ZIP file to any folder on your PC or USB flash drive.
2. Double-click 'Kifaalat-Fund.bat' (or 'Kifaalat-Fund-Silent.vbs' for a silent window).
3. The application runs immediately in a dedicated desktop window without address bars.
4. Requires NO installation and works 100% offline without internet connection.
5. All member records, contributions, and claims are securely saved on your device.
6. Compatible with Windows 7, 8, 8.1, 10, and 11 (32-bit & 64-bit).

Contact / رابطہ:
Finance Secretary: Muhammad Iqbal Khattak (0346-9100998)
=============================================================
"""

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr("Kifaalat-Fund.bat", bat_content)
        z.writestr("Kifaalat-Fund-Silent.vbs", vbs_content)
        z.writestr("README-WINDOWS.txt", readme_content)
        
        # Add all dist files
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                if file.endswith(".zip") or file.endswith(".apk"):
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, dist_dir)
                z.write(full_path, arcname=rel_path)
                
    dist_zip = os.path.join(dist_dir, "downloads", "Kifaalat-Fund-Windows-Portable.zip")
    os.makedirs(os.path.dirname(dist_zip), exist_ok=True)
    shutil.copy2(zip_path, dist_zip)
    print(f"Windows Portable ZIP created successfully: {zip_path} ({os.path.getsize(zip_path)} bytes)")

def create_android_apk():
    print("=== Creating Android Offline APK Package ===")
    template_apk = "/tmp/base-template.apk"
    if not os.path.exists(template_apk):
        print(f"Downloading base APK template...")
        subprocess.run([
            "curl", "-sL",
            "https://github.com/mikespub-archive/android-webview/releases/download/v1.28/app-release.apk",
            "-o", template_apk
        ], check=True)
        
    out_dir = os.path.abspath("public/downloads")
    os.makedirs(out_dir, exist_ok=True)
    output_apk = os.path.join(out_dir, "Kifaalat-Fund-Offline.apk")
    dist_dir = os.path.abspath("dist")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        extracted_apk = os.path.join(temp_dir, "extracted")
        with zipfile.ZipFile(template_apk, 'r') as z:
            z.extractall(extracted_apk)
            
        # Target folder for web content
        web_target = os.path.join(extracted_apk, "assets", "web")
        if os.path.exists(web_target):
            shutil.rmtree(web_target)
        os.makedirs(web_target, exist_ok=True)
        
        # Copy dist files into assets/web/
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                if file.endswith(".zip") or file.endswith(".apk"):
                    continue
                src = os.path.join(root, file)
                rel = os.path.relpath(src, dist_dir)
                dest = os.path.join(web_target, rel)
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                shutil.copy2(src, dest)
                
        # Also mirror in assets/demo and assets/local for maximum fallback compatibility
        demo_target = os.path.join(extracted_apk, "assets", "demo")
        if os.path.exists(demo_target):
            shutil.rmtree(demo_target)
        shutil.copytree(web_target, demo_target)

        # Remove previous signatures in META-INF
        meta_inf = os.path.join(extracted_apk, "META-INF")
        if os.path.exists(meta_inf):
            for item in os.listdir(meta_inf):
                if item.endswith(".RSA") or item.endswith(".SF") or item.endswith(".MF"):
                    try:
                        os.remove(os.path.join(meta_inf, item))
                    except Exception:
                        pass
        os.makedirs(meta_inf, exist_ok=True)
        
        # Generate RSA key and certificate
        key_path = os.path.join(temp_dir, "key.pem")
        cert_path = os.path.join(temp_dir, "cert.pem")
        subprocess.run([
            "openssl", "req", "-x509", "-newkey", "rsa:2048",
            "-keyout", key_path, "-out", cert_path,
            "-days", "10000", "-nodes",
            "-subj", "/CN=Kifaalat e Miyyat Fund/O=KMF/C=PK"
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Build MANIFEST.MF
        manifest_lines = [
            "Manifest-Version: 1.0",
            "Created-By: 1.0 (Android Signer)",
            ""
        ]
        
        all_files = []
        for root, dirs, files in os.walk(extracted_apk):
            for file in files:
                full = os.path.join(root, file)
                rel = os.path.relpath(full, extracted_apk).replace("\\", "/")
                if rel.startswith("META-INF/"):
                    continue
                all_files.append((rel, full))
                
        all_files.sort(key=lambda x: x[0])
        
        for rel, full in all_files:
            with open(full, 'rb') as f:
                data = f.read()
            digest = base64.b64encode(hashlib.sha256(data).digest()).decode('ascii')
            manifest_lines.append(f"Name: {rel}")
            manifest_lines.append(f"SHA-256-Digest: {digest}")
            manifest_lines.append("")
            
        manifest_data = "\r\n".join(manifest_lines) + "\r\n"
        manifest_path = os.path.join(meta_inf, "MANIFEST.MF")
        with open(manifest_path, 'wb') as f:
            f.write(manifest_data.encode('utf-8'))
            
        # Build CERT.SF
        manifest_digest = base64.b64encode(hashlib.sha256(manifest_data.encode('utf-8')).digest()).decode('ascii')
        sf_lines = [
            "Signature-Version: 1.0",
            "Created-By: 1.0 (Android Signer)",
            f"SHA-256-Digest-Manifest: {manifest_digest}",
            ""
        ]
        
        for rel, full in all_files:
            entry_header = f"Name: {rel}\r\n"
            with open(full, 'rb') as f:
                data = f.read()
            digest = base64.b64encode(hashlib.sha256(data).digest()).decode('ascii')
            entry_bytes = f"Name: {rel}\r\nSHA-256-Digest: {digest}\r\n\r\n".encode('utf-8')
            sf_entry_digest = base64.b64encode(hashlib.sha256(entry_bytes).digest()).decode('ascii')
            sf_lines.append(f"Name: {rel}")
            sf_lines.append(f"SHA-256-Digest: {sf_entry_digest}")
            sf_lines.append("")
            
        sf_data = "\r\n".join(sf_lines) + "\r\n"
        sf_path = os.path.join(meta_inf, "CERT.SF")
        with open(sf_path, 'wb') as f:
            f.write(sf_data.encode('utf-8'))
            
        # Sign CERT.SF to create CERT.RSA
        rsa_path = os.path.join(meta_inf, "CERT.RSA")
        subprocess.run([
            "openssl", "smime", "-sign",
            "-in", sf_path,
            "-out", rsa_path,
            "-outform", "DER",
            "-inkey", key_path,
            "-signer", cert_path,
            "-nodetach"
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Package into signed APK
        with zipfile.ZipFile(output_apk, 'w', zipfile.ZIP_DEFLATED) as z_out:
            # Place META-INF first or standard
            for root, dirs, files in os.walk(extracted_apk):
                for file in files:
                    full = os.path.join(root, file)
                    rel = os.path.relpath(full, extracted_apk).replace("\\", "/")
                    z_out.write(full, arcname=rel)
                    
    dist_apk = os.path.join(dist_dir, "downloads", "Kifaalat-Fund-Offline.apk")
    os.makedirs(os.path.dirname(dist_apk), exist_ok=True)
    shutil.copy2(output_apk, dist_apk)
    print(f"Android Offline APK created successfully: {output_apk} ({os.path.getsize(output_apk)} bytes)")

if __name__ == "__main__":
    create_windows_portable()
    create_android_apk()
    print("All packages built successfully!")
