/**
 * Cryptographic helpers for End-to-End Encryption, Hashes, and QR Generation
 */

export async function sha256Hex(text: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Derive AES-GCM key from password and salt
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt payload object with user passphrase
export async function encryptVault(data: object, passphrase: string): Promise<string> {
  const jsonStr = JSON.stringify(data);
  const enc = new TextEncoder();
  const encodedData = enc.encode(jsonStr);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const encryptedBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );

  // Combine salt + iv + ciphertext safely without stack overflow on large payloads
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
  const cipherBytes = new Uint8Array(encryptedBuf);
  const chars: string[] = new Array(cipherBytes.length);
  for (let i = 0; i < cipherBytes.length; i++) {
    chars[i] = String.fromCharCode(cipherBytes[i]);
  }
  const cipherBase64 = btoa(chars.join(''));

  return JSON.stringify({
    version: '1.0',
    type: 'KMF_ENCRYPTED_VAULT',
    salt: saltHex,
    iv: ivHex,
    cipher: cipherBase64,
    created: new Date().toISOString()
  });
}

// Decrypt vault object with passphrase
export async function decryptVault(vaultString: string, passphrase: string): Promise<any> {
  const vault = JSON.parse(vaultString);
  if (vault.type !== 'KMF_ENCRYPTED_VAULT') {
    throw new Error('Invalid vault file format.');
  }

  const salt = new Uint8Array(vault.salt.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));
  const iv = new Uint8Array(vault.iv.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));
  const rawCipher = atob(vault.cipher);
  const cipherBytes = new Uint8Array(rawCipher.length);
  for (let i = 0; i < rawCipher.length; i++) {
    cipherBytes[i] = rawCipher.charCodeAt(i);
  }

  const key = await deriveKey(passphrase, salt);

  const decryptedBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    cipherBytes
  );

  const dec = new TextDecoder();
  const jsonStr = dec.decode(decryptedBuf);
  return JSON.parse(jsonStr);
}

// Generate simple deterministic QR-like matrix SVG for receipts
export function generateQrSvg(content: string, size = 120): string {
  // Simple 21x21 QR code visualizer based on string hash for authentic visual receipt representation
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = (hash << 5) - hash + content.charCodeAt(i);
    hash |= 0;
  }

  const grid = 21;
  const cellSize = size / grid;
  let rects = '';

  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      // 3 finder corners
      const isTopLeft = r < 7 && c < 7;
      const isTopRight = r < 7 && c >= grid - 7;
      const isBottomLeft = r >= grid - 7 && c < 7;

      let isBlack = false;
      if (isTopLeft || isTopRight || isBottomLeft) {
        const localR = isBottomLeft ? r - (grid - 7) : r;
        const localC = isTopRight ? c - (grid - 7) : c;
        if (
          localR === 0 || localR === 6 || localC === 0 || localC === 6 ||
          (localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4)
        ) {
          isBlack = true;
        }
      } else {
        // pseudo-random cell based on coordinates and string hash
        const val = Math.abs(Math.sin((r * 31 + c * 17) + hash) * 10000);
        isBlack = Math.floor(val) % 2 === 0;
      }

      if (isBlack) {
        rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize + 0.3}" height="${cellSize + 0.3}" fill="#0f172a" />`;
      }
    }
  }

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" class="rounded bg-white p-1 shadow-xs border border-slate-200">
    <rect width="${size}" height="${size}" fill="#ffffff"/>
    ${rects}
  </svg>`;
}
