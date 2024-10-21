import { RecordModel } from "../models/record.model.js";

// Controller to handle database insertion
/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload CSV and insert valid stock records
 *     description: Uploads a CSV file and inserts valid stock records into the database after validation.
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
 *                 description: CSV file containing stock data
 *     responses:
 *       201:
 *         description: Records inserted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Records inserted successfully
 *                 insertedRecords:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2024-10-20"
 *                       symbol:
 *                         type: string
 *                         example: "AAPL"
 *                       series:
 *                         type: string
 *                         example: "EQ"
 *                       prev_close:
 *                         type: number
 *                         example: 150.25
 *                       open:
 *                         type: number
 *                         example: 151.0
 *                       high:
 *                         type: number
 *                         example: 153.5
 *                       low:
 *                         type: number
 *                         example: 149.75
 *                       last:
 *                         type: number
 *                         example: 152.0
 *                       close:
 *                         type: number
 *                         example: 152.25
 *                       vwap:
 *                         type: number
 *                         example: 151.5
 *                       volume:
 *                         type: number
 *                         example: 100000
 *                       turnover:
 *                         type: number
 *                         example: 5000000
 *                       trades:
 *                         type: number
 *                         example: 2000
 *                       deliverable:
 *                         type: number
 *                         example: 50000
 *                       percentage_deliverable:
 *                         type: number
 *                         example: 50.0
 *       400:
 *         description: No valid rows to insert
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: No valid rows to insert into the database
 *       500:
 *         description: Database insertion failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: DB insertion failed
 *                 error:
 *                   type: string
 */

export const insertValidRecords = async (req, res) => {
  const validRows = req.validRows || [];

  if (validRows.length > 0) {
    try {
      const insertedRecords = await RecordModel.insertMany(
        validRows.map((row) => ({
          date: row.Date,
          symbol: row.Symbol,
          series: row.Series,
          prev_close: row["Prev Close"],
          open: row.Open,
          high: row.High,
          low: row.Low,
          last: row.Last,
          close: row.Close,
          vwap: row.VWAP,
          volume: row.Volume,
          turnover: row.Turnover,
          trades: row.Trades,
          deliverable: row["Deliverable Volume"],
          percentage_deliverable: row["%Deliverble"],
        }))
      );

      return res.status(201).json({
        msg: "Records inserted successfully",
        insertedRecords,
        validationDetails: req.validationDetails,
      });
    } catch (error) {
      console.error("Error during DB insertion", error);
      return res.status(500).json({ msg: "DB insertion failed", error });
    }
  } else {
    return res
      .status(400)
      .json({ msg: "No valid rows to insert into the database" });
  }
};
