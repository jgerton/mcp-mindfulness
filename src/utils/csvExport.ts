import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import fs from 'fs';

/**
 * Utility for exporting data to CSV format
 */
export class CsvExporter {
  /**
   * Exports data to a CSV file
   * @param data Array of objects to export
   * @param headers Array of header configurations
   * @param outputPath Path where the CSV file should be saved
   * @returns Promise that resolves with the path to the created file
   */
  static async exportToCsv<T extends Record<string, any>>(
    data: T[],
    headers: { id: string; title: string }[],
    outputPath: string
  ): Promise<string> {
    // Ensure the directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const csvWriter = createObjectCsvWriter({
      path: outputPath,
      header: headers
    });

    await csvWriter.writeRecords(data);
    return outputPath;
  }
} 