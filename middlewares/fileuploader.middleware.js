import multer from "multer";
import path from "path";
import fs from "fs";
import csvParser from "csv-parser";
import moment from "moment";
import { RecordModel } from "../models/record.model.js";

// Ensure the upload directory exists

// const uploadDir = path.join("upload/csv/");
const uploadDir = path.join(process.env.UPLOAD_DIR || "upload/csv/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// List of required columns for validation
const requiredColumns = [
  "Date",
  "Symbol",
  "Series",
  "Prev Close",
  "Open",
  "High",
  "Low",
  "Last",
  "Close",
  "VWAP",
  "Volume",
  "Turnover",
  "Trades",
  "Deliverable Volume",
  "%Deliverble",
];

// Helper function to validate data
const isNumeric = (value) => !isNaN(parseFloat(value)) && isFinite(value);

// Check file type (only CSV allowed)
function checkFileType(file, cb) {
  const filetypes = /csv/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Error: CSV Only (.csv files only)"));
  }
}

// Multer setup
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const uploadcsv = multer({
  storage: storageConfig,
  limits: { fileSize: process.env.CSV_FILE_SIZE_LIMIT },
  fileFilter: (req, file, cb) => checkFileType(file, cb),
}).single("csvFile");

// Function to validate CSV content
const validateCSVContent = (filePath, cb) => {
  const headersSet = new Set();
  const validRows = [];
  const invalidRows = [];
  let successfulRecords = 0;
  let failedRecords = 0;

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("headers", (headers) => {
      headers.forEach((header) => headersSet.add(header.trim()));

      const missingColumns = requiredColumns.filter(
        (col) => !headersSet.has(col)
      );

      if (missingColumns.length > 0) {
        return cb({
          success: false,
          message: "Missing required columns",
          missingColumns,
        });
      }
    })
    .on("data", (row) => {
      const {
        Date,
        "Prev Close": PrevClose,
        Open,
        High,
        Low,
        Last,
        Close,
        VWAP,
        Volume,
        Turnover,
        Trades,
        "Deliverable Volume": Deliverable,
        "%Deliverble": DeliverablePercentage,
      } = row;

      let isValid = true;

      // Validate Date
      if (!moment(Date, "YYYY-MM-DD", true).isValid()) {
        isValid = false;
      }

      // Validate numeric fields
      const numericFields = [
        PrevClose,
        Open,
        High,
        Low,
        Last,
        Close,
        VWAP,
        Volume,
        Turnover,
        Trades,
        Deliverable,
        DeliverablePercentage,
      ];
      numericFields.forEach((field) => {
        if (!isNumeric(field)) {
          isValid = false;
        }
      });

      if (isValid) {
        successfulRecords++;
        validRows.push(row);
      } else {
        failedRecords++;
        invalidRows.push(row);
      }
    })
    .on("end", () => {
      cb({
        success: true,
        totalRecords: successfulRecords + failedRecords,
        successfulRecords,
        failedRecords,
        validRows,
        invalidRows,
      });
    })
    .on("error", (err) => {
      cb({ success: false, message: err.message });
    });
};

// Middleware to upload CSV and validate content
/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a CSV file
 *     description: Uploads a CSV file and validates its content, ensuring required columns and correct data formats.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               csvFile:
 *                 type: string
 *                 format: binary
 *                 description: The CSV file to be uploaded.
 *     responses:
 *       200:
 *         description: CSV file uploaded and validated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "CSV validation successful"
 *                 validationDetails:
 *                   type: object
 *                   properties:
 *                     totalRecords:
 *                       type: integer
 *                       example: 100
 *                     successfulRecords:
 *                       type: integer
 *                       example: 95
 *                     failedRecords:
 *                       type: integer
 *                       example: 5
 *                     validRows:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           Date:
 *                             type: string
 *                             example: "2024-10-22"
 *                           Symbol:
 *                             type: string
 *                             example: "AAPL"
 *                           Series:
 *                             type: string
 *                             example: "EQ"
 *                           Prev Close:
 *                             type: number
 *                             example: 150.00
 *                           Open:
 *                             type: number
 *                             example: 152.00
 *                           High:
 *                             type: number
 *                             example: 153.00
 *                           Low:
 *                             type: number
 *                             example: 149.00
 *                           Last:
 *                             type: number
 *                             example: 151.00
 *                           Close:
 *                             type: number
 *                             example: 150.50
 *                           VWAP:
 *                             type: number
 *                             example: 151.25
 *                           Volume:
 *                             type: integer
 *                             example: 1000000
 *                           Turnover:
 *                             type: number
 *                             example: 150000000.00
 *                           Trades:
 *                             type: integer
 *                             example: 1000
 *                           Deliverable Volume:
 *                             type: integer
 *                             example: 800000
 *                           %Deliverble:
 *                             type: number
 *                             example: 80
 *       400:
 *         description: Error occurred during file upload or validation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error: CSV Only (.csv files only)"
 *                 msg:
 *                   type: string
 *                   example: "Error occurred while uploading file"
 *                 details:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Missing required columns"
 *                     missingColumns:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "Date"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "An error occurred while processing the CSV file."
 */

export const uploadCSV = (req, res, next) => {
  uploadcsv(req, res, function (err) {
    if (err instanceof multer.MulterError || err) {
      console.error(err);
      return res.status(400).json({
        error: err.message,
        msg: "Error occurred while uploading file",
      });
    }
    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
        msg: "Please upload a CSV file",
      });
    }
    const filePath = req.file.path;
    validateCSVContent(filePath, (validationResult) => {
      if (!validationResult.success) {
        return res.status(400).json({
          msg: "CSV validation failed",
          details: validationResult,
        });
      }

      // Save the valid rows in `req` for the next middleware
      req.validRows = validationResult.validRows;
      req.invalidRows = validationResult.invalidRows;
      req.validationDetails = validationResult;

      next(); // Move to the next middleware for DB insertion
    });
  });
};
