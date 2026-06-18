import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ZCore API",
      version: "1.0.0",
      description: "API middleware de scoring para plataformas DeFi",
      contact: {
        name: "ZCore Team",
        url: "https://zcore.dev",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        LenderApiKey: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "Lender API key",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            walletAddress: { type: "string" },
            profileTier: { type: "string", enum: ["A", "B", "C"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
