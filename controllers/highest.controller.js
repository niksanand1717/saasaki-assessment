import { RecordModel } from "../models/record.model.js";

/**
 * @swagger
 * /api/highest_volume:
 *   get:
 *     summary: Retrieve the highest trading volume
 *     description: Fetches the highest trading volume for a given date range and optional stock symbol. Results can be limited to a specific number of records.
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
 *         required: false
 *         schema:
 *           type: string
 *           example: "AAPL"
 *         description: (Optional) Stock symbol to filter the results.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 5
 *         description: (Optional) Limit the number of records returned (default is 1).
 *     responses:
 *       200:
 *         description: Successfully retrieved the highest trading volume
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 highest_volume:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2024-10-15"
 *                       symbol:
 *                         type: string
 *                         example: "AAPL"
 *                       volume:
 *                         type: integer
 *                         example: 1000000
 *       400:
 *         description: Missing required query parameters or invalid date format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required query parameters: 'start_date' and 'end_date' are required."
 *       404:
 *         description: No records found for the given criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No records found for the given criteria."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while fetching the highest volume. Please try again later."
 */

export const getHighest = async (req, res) => {
  try {
    console.log("Get Highest API");
    const { start_date, end_date, symbol, limit } = req.query;

    // Check if required query parameters are provided
    if (!start_date || !end_date) {
      return res.status(400).json({
        message:
          "Missing required query parameters: 'start_date' and 'end_date' are required.",
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

    // Parse the limit value (default to 1 if not provided)
    const queryLimit = parseInt(limit) || 1;

    // Create the aggregation pipeline
    const pipeline = [
      {
        $match: {
          date: { $gte: new Date(start_date), $lte: new Date(end_date) },
          ...(symbol && { symbol }), // Include symbol in filter if provided
        },
      },
      {
        $group: {
          _id: "$symbol",
          date: { $first: "$date" },
          symbol: { $first: "$symbol" },
          volume: { $max: "$volume" }, // Get the maximum volume for each symbol
        },
      },
      { $sort: { volume: -1 } }, // Sort by volume in descending order
      { $limit: queryLimit }, // Limit the result set
    ];

    // Execute the aggregation pipeline
    const result = await RecordModel.aggregate(pipeline);

    // Handle case when no results are found
    if (result.length === 0) {
      return res.status(404).json({
        message: `No records found for the given criteria.`,
      });
    }

    // Format the result to match the requested structure
    const formattedResult = result.map((record) => ({
      date: record.date.toISOString().split("T")[0], // Format the date as 'YYYY-MM-DD'
      symbol: record.symbol,
      volume: record.volume,
    }));

    // Respond with the highest volume result(s)
    res.status(200).json({ highest_volume: formattedResult });
  } catch (error) {
    console.error("Error in getHighest API:", error);
    res.status(500).json({
      message:
        "An error occurred while fetching the highest volume. Please try again later.",
    });
  }
};
