import { RecordModel } from "../models/record.model.js";

/**
 * @swagger
 * /api/average_vwap:
 *   get:
 *     summary: Get Average VWAP for a Symbol
 *     description: Calculates the average VWAP for a specific stock symbol within a date range.
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the date range (e.g., YYYY-MM-DD).
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the date range (e.g., YYYY-MM-DD).
 *       - in: query
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol to calculate the average VWAP (e.g., AAPL).
 *     responses:
 *       200:
 *         description: Average VWAP calculated successfully
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
 *                   example: "2024-01-01"
 *                 end_date:
 *                   type: string
 *                   example: "2024-10-20"
 *                 average_vwap:
 *                   type: number
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
 *         description: No records found for the given symbol within the date range
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No records found for symbol 'AAPL' within the date range."
 *       500:
 *         description: Error calculating the average VWAP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while calculating the average VWAP. Please try again later."
 */

export const getAverageVwap = async (req, res) => {
  try {
    const { start_date, end_date, symbol } = req.query;

    // Check if required query parameters are provided
    if (!start_date || !end_date || !symbol) {
      return res.status(400).json({
        message:
          "Missing required query parameters: 'start_date', 'end_date', and 'symbol' are required.",
      });
    }

    // Validate the date format
    const startDateValid = !isNaN(new Date(start_date).getTime());
    const endDateValid = !isNaN(new Date(end_date).getTime());

    if (!startDateValid || !endDateValid) {
      return res.status(400).json({
        message:
          "Invalid date format. Please provide 'start_date' and 'end_date' in a valid format (e.g., YYYY-MM-DD).",
      });
    }

    // Create the aggregation pipeline
    const pipeline = [
      {
        $match: {
          date: { $gte: new Date(start_date), $lte: new Date(end_date) },
          symbol,
        },
      },
      {
        $group: {
          _id: null, // We don't need to group by any field, so we use `null`
          average_vwap: { $avg: "$vwap" }, // Calculate the average of the 'vwap' field
        },
      },
    ];

    // Execute the aggregation pipeline
    const result = await RecordModel.aggregate(pipeline);

    // Check if results are empty
    if (!result || result.length === 0) {
      return res.status(404).json({
        message: `No records found for symbol '${symbol}' within the date range.`,
      });
    }

    // Respond with the average VWAP value
    res.status(200).json({
      symbol,
      start_date,
      end_date,
      average_vwap: result[0].average_vwap,
    });
  } catch (error) {
    console.error("Error in getAverageVwap API:", error);
    res.status(500).json({
      message:
        "An error occurred while calculating the average VWAP. Please try again later.",
    });
  }
};
