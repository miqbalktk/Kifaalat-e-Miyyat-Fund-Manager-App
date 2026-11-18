import { getAccessToken } from './googleDriveAuth';

export const TARGET_DRIVE_FOLDER_ID = '1V0P51iI6xhwEBRp4TfyyU26Pd0PV-zu8';
export const TARGET_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1V0P51iI6xhwEBRp4TfyyU26Pd0PV-zu8';
export const DEFAULT_BACKUP_PASSPHRASE = '1234';

export interface DriveBackupFile {
  id: string;
  name: string;
  createdTime: string;
  size?: string;
  modifiedTime?: string;
}

/**
 * Upload encrypted backup file to the specified Google Drive folder
 */
export async function uploadBackupToDrive(
  encryptedJsonString: string,
  customFileName?: string
): Promise<{ success: boolean; fileId?: string; fileName?: string; error?: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Drive access token not available. Please sign in with Google first.');
  }

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
  const fileName = customFileName || `kmf-backup-${dateStr}_${timeStr}.kmf`;

  // First attempt: Upload directly into specified target folder
  try {
    const result = await doMultipartUpload(token, fileName, encryptedJsonString, [TARGET_DRIVE_FOLDER_ID]);
    return { success: true, fileId: result.id, fileName };
  } catch (err: any) {
    console.warn('Upload to specific folder failed, attempting fallback to Drive root:', err);
    // Fallback: If target folder ID is restricted or not writeable by user's account, upload to Drive root
    try {
      const fallbackResult = await doMultipartUpload(token, fileName, encryptedJsonString);
      return { success: true, fileId: fallbackResult.id, fileName };
    } catch (fallbackErr: any) {
      return { success: false, error: fallbackErr.message || 'Failed to upload to Google Drive' };
    }
  }
}

/**
 * Helper to perform multipart upload to Google Drive v3
 */
async function doMultipartUpload(
  token: string,
  fileName: string,
  content: string,
  parents?: string[]
): Promise<{ id: string; name: string }> {
  const metadata: Record<string, any> = {
    name: fileName,
    mimeType: 'application/json',
    description: 'Kifaalat e Miyyat Fund Encrypted Backup (AES-256-GCM, Password: 1234)',
  };

  if (parents && parents.length > 0) {
    metadata.parents = parents;
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    content +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,parents',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Drive API error (${response.status}): ${errText}`);
  }

  return response.json();
}

/**
 * List existing backup files from Google Drive
 */
export async function listBackupsFromDrive(): Promise<DriveBackupFile[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Drive access token not available. Please sign in with Google.');
  }

  // Query files in target folder or matching kmf-backup name pattern
  const query = `'${TARGET_DRIVE_FOLDER_ID}' in parents and trashed = false`;
  const fallbackQuery = `name contains 'kmf-backup' and trashed = false`;

  let files: DriveBackupFile[] = [];

  try {
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=createdTime desc&fields=files(id,name,createdTime,size,modifiedTime)&pageSize=30`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const json = await res.json();
      files = json.files || [];
    }
  } catch (err) {
    console.warn('Error querying target folder files:', err);
  }

  // If no files found in folder, search by name prefix across user's accessible files
  if (files.length === 0) {
    try {
      const fallbackUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(fallbackQuery)}&orderBy=createdTime desc&fields=files(id,name,createdTime,size,modifiedTime)&pageSize=30`;
      const resFallback = await fetch(fallbackUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resFallback.ok) {
        const json = await resFallback.json();
        files = json.files || [];
      }
    } catch (err) {
      console.warn('Fallback search failed:', err);
    }
  }

  return files;
}

/**
 * Download a backup file's encrypted contents from Google Drive
 */
export async function downloadBackupFromDrive(fileId: string): Promise<string> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Drive access token not available. Please sign in with Google.');
  }

  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to download backup file (${res.status}): ${errText}`);
  }

  return res.text();
}
