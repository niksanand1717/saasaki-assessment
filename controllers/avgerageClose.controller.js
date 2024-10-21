import { RecordModel } from "../models/record.model.js";

/**
 * @swagger
 * /api/average_close:
 *   get:
 *     summary: Calculate the average closing price
 *     description: Calculates the average closing price for a specified stock symbol within a given date range.
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-10-01"
 *         description: Start date for the date range (YYYY-MM-DD).
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-10-31"
 *         description: End date for the date range (YYYY-MM-DD).
 *       - in: query
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *           example: "AAPL"
 *         description: Stock symbol for which to calculate the average closing price.
 *     responses:
 *       200:
 *         description: Successfully calculated the average closing price
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 symbol:
 *                   type: string
 *                   example: "AAPL"
 *                 start_date:
 *                   type: string
 *                   format: date
 *                   example: "2024-10-01"
 *                 end_date:
 *                   type: string
 *                   format: date
 *                   example: "2024-10-31"
 *                 average_close:
 *                   type: number
 *                   format: float
 *                   example: 150.75
 *       400:
 *         description: Missing required query parameters or invalid date format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required query parameters: 'start_date', 'end_date', and 'symbol' are required."
 *       404:
 *         description: No records found for the specified symbol and date range
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No records found for symbol 'AAPL' between '2024-10-01' and '2024-10-31'."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while calculating the average close. Please try again later."
 */

export const getAverageClose = async (req, res) => {
  try {
    const { start_date, end_date, symbol } = req.query;

    // Check if all required query parameters are provided
    if (!start_date || !end_date || !symbol) {
      return res.status(400).json({
        message:
          "Missing required query parameters: 'start_date', 'end_date', and 'symbol' are required.",
      });
    }

    // Ensure the date format is correct (optional, but good to validate)
    const startDateValid = !isNaN(new Date(start_date).getTime());
    const endDateValid = !isNaN(new Date(end_date).getTime());

    if (!startDateValid || !endDateValid) {
      return res.status(400).json({
        message:
          "Invalid date format. Please provide 'start_date' and 'end_date' in a valid format (e.g., YYYY-MM-DD).",
      });
    }

    // Query the database for records within the specified date range and for the given symbol
    const filter = {
      date: { $gte: new Date(start_date), $lte: new Date(end_date) },
      symbol,
    };
    const result = await RecordModel.find(filter);

    if (result.length === 0) {
      return res.status(404).json({
        message: `No records found for symbol '${symbol}' between '${start_date}' and '${end_date}'.`,
      });
    }

    // Calculate the average of the 'close' field
    let totalClose = 0;
    result.forEach((record) => {
      totalClose += record.close;
    });
    const average_close = totalClose / result.length;

    // Respond with the calculated average
    res.status(200).json({
      symbol,
      start_date,
      end_date,
      average_close: average_close.toFixed(2), // Keeping it to two decimal places
    });
  } catch (error) {
    console.error("Error calculating average close:", error);
    res.status(500).json({
      message:
        "An error occurred while calculating the average close. Please try again later.",
    });
  }
};
