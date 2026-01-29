/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - File storage service for uploaded files
 */

import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { FileInfo } from '../types/widget';

class FileStore {
  private files: Map<string, FileInfo> = new Map();
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      console.log(`[FileStore] Created uploads directory: ${this.uploadDir}`);
    }
  }

  getUploadDirectory(): string {
    return this.uploadDir;
  }

  saveFile(file: Express.Multer.File): FileInfo {
    const fileId = uuidv4();
    const fileExtension = path.extname(file.originalname);
    const storedFileName = `${fileId}${fileExtension}`;
    const filePath = path.join(this.uploadDir, storedFileName);

    fs.writeFileSync(filePath, file.buffer);

    const fileType = this.determineFileType(file.mimetype, fileExtension);

    const fileInfo: FileInfo = {
      id: fileId,
      fileName: file.originalname,
      fileType: fileType,
      mimeType: file.mimetype,
      url: `/api/files/${fileId}`,
      size: file.size,
      uploadedAt: new Date().toISOString()
    };

    this.files.set(fileId, fileInfo);
    console.log(`[FileStore] File saved: ${fileId} (${file.originalname}, ${this.formatBytes(file.size)})`);

    return fileInfo;
  }

  private determineFileType(mimeType: string, extension: string): string {
    if (mimeType.startsWith('image/')) {
      return 'image';
    }
    if (mimeType === 'application/pdf') {
      return 'pdf';
    }
    if (mimeType.includes('spreadsheet') || extension === '.xlsx' || extension === '.xls') {
      return 'excel';
    }
    if (mimeType === 'text/csv' || extension === '.csv') {
      return 'csv';
    }
    return 'other';
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getFile(id: string): string | null {
    const fileInfo = this.files.get(id);
    if (!fileInfo) {
      return null;
    }

    const fileExtension = path.extname(fileInfo.fileName);
    const filePath = path.join(this.uploadDir, `${id}${fileExtension}`);

    if (fs.existsSync(filePath)) {
      return filePath;
    }

    return null;
  }

  getFileInfo(id: string): FileInfo | null {
    return this.files.get(id) || null;
  }

  getAllFiles(): FileInfo[] {
    return Array.from(this.files.values());
  }
}

export const fileStore = new FileStore();
