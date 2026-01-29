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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
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
