import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Storra API Documentation",
      version: "1.0.0",
      description: "API documentation for Storra backend",
    },
    servers: [
      {
        url: "http://localhost:7001/api/v1",
        description: "Local server",
      },
      {
        url: "https://your-ngrok-or-live-url/api/v1",
        description: "Production server",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);

// THIS IS THE FIX
export const swaggerUiHandler = swaggerUi;
