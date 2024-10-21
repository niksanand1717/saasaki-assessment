import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// Swagger configuration options
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Stock Data Upload API",
      version: "1.0.0",
      description: "API documentation for the stock data upload system",
    },
    servers: [
      {
        url: "http://localhost:5555", // Replace with your server URL
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js", "./midllewares/.*js"], // Path to the API docs
};

// Initialize Swagger JSDoc
const swaggerSpecs = swaggerJsdoc(swaggerOptions);

export { swaggerSpecs, swaggerUi };
