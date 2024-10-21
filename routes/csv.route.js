import express from "express";
import { uploadCSV } from "../middlewares/fileuploader.middleware.js";
import { insertValidRecords } from "../controllers/validrow.controller.js";

const router = express.Router();
/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a CSV file containing stock data
 *     description: This endpoint allows you to upload a CSV file containing stock data which will be validated and stored in the database.
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               csvFile:
 *                 type: string
 *                 format: binary
 *                 description: The CSV file to be uploaded
 *           required:
 *             - csvFile
 *     responses:
 *       201:
 *         description: CSV file uploaded successfully and data inserted
 *       400:
 *         description: Bad request, validation error, or upload error
 */

router.post("/upload", uploadCSV, insertValidRecords);

export default router;
