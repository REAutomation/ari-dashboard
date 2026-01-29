/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - JSON file persistence service
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');

export class PersistenceService {
  /**
   * Ensure the data directory exists
   */
  static ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log(`[PersistenceService] Created data directory: ${DATA_DIR}`);
    }
  }

  /**
   * Read JSON data from a file
   * @param filename - Name of the file (e.g., 'widgets.json')
   * @returns Parsed JSON data or null if file doesn't exist or is invalid
   */
  static readJSON<T>(filename: string): T | null {
    try {
      const filePath = path.join(DATA_DIR, filename);
      
      if (!fs.existsSync(filePath)) {
        console.log(`[PersistenceService] File not found: ${filename} - returning null`);
        return null;
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent) as T;
      console.log(`[PersistenceService] Successfully read ${filename}`);
      return data;
    } catch (error) {
      console.error(`[PersistenceService] Error reading ${filename}:`, error);
      return null;
    }
  }

  /**
   * Write JSON data to a file
   * @param filename - Name of the file (e.g., 'widgets.json')
   * @param data - Data to write
   */
  static writeJSON<T>(filename: string, data: T): void {
    try {
      this.ensureDataDir();
      const filePath = path.join(DATA_DIR, filename);
      const jsonContent = JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, jsonContent, 'utf-8');
      console.log(`[PersistenceService] Successfully wrote ${filename}`);
    } catch (error) {
      console.error(`[PersistenceService] Error writing ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Delete a JSON file
   * @param filename - Name of the file to delete
   * @returns true if deleted, false if file didn't exist
   */
  static deleteJSON(filename: string): boolean {
    try {
      const filePath = path.join(DATA_DIR, filename);
      
      if (!fs.existsSync(filePath)) {
        console.log(`[PersistenceService] File not found for deletion: ${filename}`);
        return false;
      }

      fs.unlinkSync(filePath);
      console.log(`[PersistenceService] Successfully deleted ${filename}`);
      return true;
    } catch (error) {
      console.error(`[PersistenceService] Error deleting ${filename}:`, error);
      return false;
    }
  }
}
