"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvExporter = void 0;
const csv_writer_1 = require("csv-writer");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/**
 * Utility for exporting data to CSV format
 */
class CsvExporter {
    /**
     * Exports data to a CSV file
     * @param data Array of objects to export
     * @param headers Array of header configurations
     * @param outputPath Path where the CSV file should be saved
     * @returns Promise that resolves with the path to the created file
     */
    static async exportToCsv(data, headers, outputPath) {
        // Ensure the directory exists
        const dir = path_1.default.dirname(outputPath);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
            path: outputPath,
            header: headers
        });
        await csvWriter.writeRecords(data);
        return outputPath;
    }
}
exports.CsvExporter = CsvExporter;
