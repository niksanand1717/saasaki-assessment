import express from "express";
import { getHighest } from "../controllers/highest.controller.js";
import { getAverageClose } from "../controllers/avgerageClose.controller.js";
import { getAverageVwap } from "../controllers/averageVWAP.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/highest_volume:
 *   get:
 *     summary: Get stock records with the highest volume
 *     description: Retrieves stock records with the highest volume based on the provided date range.
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: symbol
 *         schema:
 *           type: string
 *         description: Stock symbol to filter by
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records to return (default is 1)
 *     responses:
 *       200:
 *         description: A list of stock records with the highest volume
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
 *                       symbol:
 *                         type: string
 *                       volume:
 *                         type: number
 */
router.get("/highest_volume", getHighest);

/**
 * @swagger
 * /api/average_close:
 *   get:
 *     summary: Calculate the average closing price of a stock
 *     description: Calculates the average closing price of a stock within the given date range.
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: symbol
 *         schema:
 *           type: string
 *         required: true
 *         description: The stock symbol to calculate the average closing price for
 *     responses:
 *       200:
 *         description: The average closing price for the specified stock and date range
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 symbol:
 *                   type: string
 *                 start_date:
 *                   type: string
 *                   format: date
 *                 end_date:
 *                   type: string
 *                   format: date
 *                 average_close:
 *                   type: number
 */
router.get("/average_close", getAverageClose);

/**
 * @swagger
 * /api/average_vwap:
 *   get:
 *     summary: Calculate the average VWAP of a stock
 *     description: Calculates the average VWAP (Volume Weighted Average Price) of a stock within the given date range.
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: symbol
 *         schema:
 *           type: string
 *         required: true
 *         description: The stock symbol to calculate the average VWAP for
 *     responses:
 *       200:
 *         description: The average VWAP for the specified stock and date range
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 symbol:
 *                   type: string
 *                 start_date:
 *                   type: string
 *                   format: date
 *                 end_date:
 *                   type: string
 *                   format: date
 *                 average_vwap:
 *                   type: number
 */
router.get("/average_vwap", getAverageVwap);

export default router;
