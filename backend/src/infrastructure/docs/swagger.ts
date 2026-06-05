import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./openapi";

export const setupSwaggerDocs = (app: Express) => {
  app.get("/api/docs.json", (_req, res) => {
    res.json(openApiSpec);
  });

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, {
      customSiteTitle: "Marketplace API Docs",
      swaggerOptions: {
        persistAuthorization: true,
      },
    }),
  );
};
