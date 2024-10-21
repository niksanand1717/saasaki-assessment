import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { dbConnect } from "./utils/db.utils.js";
import csvRoutes from "./routes/csv.route.js";
import stockRoutes from "./routes/stocks.route.js";

// Import Swagger configuration
import { swaggerSpecs, swaggerUi } from "./swagger.js";

const server = express();

dotenv.config();

// Middleware
server.use(cors());

// Swagger UI route
server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
// API Routes
server.use("/", csvRoutes); // Routes for CSV operations
server.use("/api/", stockRoutes); // Routes for stock data APIs

// Start the server
const port = process.env.PORT || 81;
server.listen(port, () => {
  console.log("Server started at port", port);
  dbConnect();
});
