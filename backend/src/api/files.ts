/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - File upload and serving API endpoints
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { fileStore } from '../services/fileStore';

const router = Router();

// Whitelisted directories for serving local files
const ALLOWED_DIRECTORIES = [
  '/home/node',
  '/home/developer',
  '/tmp',
  '/shared',
];

// MIME types for common files
const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.html': 'text/html',
  '.txt': 'text/plain',
  '.json': 'application/json',
  '.csv': 'text/csv',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Serve local files from whitelisted directories
router.get('/serve', (req: Request, res: Response) => {
  try {
    const filePath = req.query.path as string;

    if (!filePath) {
      return res.status(400).json({ error: 'Missing "path" query parameter' });
    }

    // Normalize and resolve the path
    const resolvedPath = path.resolve(filePath);

    // Security: Check if path is within allowed directories
    const isAllowed = ALLOWED_DIRECTORIES.some(dir => resolvedPath.startsWith(dir));
    if (!isAllowed) {
      console.warn(`[FilesAPI] Blocked access to: ${resolvedPath}`);
      return res.status(403).json({
        error: 'Access denied. Path not in allowed directories.',
        allowed: ALLOWED_DIRECTORIES
      });
    }

    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if it's a file (not directory)
    const stats = fs.statSync(resolvedPath);
    if (!stats.isFile()) {
      return res.status(400).json({ error: 'Path is not a file' });
    }

    // Determine MIME type
    const ext = path.extname(resolvedPath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    // Serve the file
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(resolvedPath)}"`);

    const fileStream = fs.createReadStream(resolvedPath);
    fileStream.pipe(res);

    console.log(`[FilesAPI] Serving file: ${resolvedPath}`);
  } catch (error) {
    console.error('[FilesAPI] Error serving local file:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

router.post('/upload', upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileInfo = fileStore.saveFile(req.file);

    res.status(201).json(fileInfo);
  } catch (error) {
    console.error('[FilesAPI] Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const filePath = fileStore.getFile(id);

    if (!filePath) {
      return res.status(404).json({ error: 'File not found' });
    }

    const fileInfo = fileStore.getFileInfo(id);
    if (!fileInfo) {
      return res.status(404).json({ error: 'File metadata not found' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.setHeader('Content-Type', fileInfo.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${fileInfo.fileName}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('[FilesAPI] Error serving file:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

router.get('/:id/info', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const fileInfo = fileStore.getFileInfo(id);

    if (!fileInfo) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json(fileInfo);
  } catch (error) {
    console.error('[FilesAPI] Error fetching file info:', error);
    res.status(500).json({ error: 'Failed to fetch file info' });
  }
});

export default router;
