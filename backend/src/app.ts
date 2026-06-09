import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import onionUploadRoutes from "./presentation/http/routes/upload.routes";
import onionLoanRoutes from "./presentation/http/routes/loan.routes";
import onionQueueRoutes from "./presentation/http/routes/queue.routes";
import onionAuthRoutes from "./presentation/http/routes/auth.routes";
import onionProductRoutes from "./presentation/http/routes/product.routes";
import onionOrderRoutes from "./presentation/http/routes/order.routes";
import onionFinancingRoutes from "./presentation/http/routes/financing.routes";
import onionShipmentRoutes from "./presentation/http/routes/shipment.routes";
import onionChatRoutes from "./presentation/http/routes/chat.routes";
import onionNotificationRoutes from "./presentation/http/routes/notification.routes";
import onionPushRoutes from "./presentation/http/routes/push.routes";
import onionAdminRoutes from "./presentation/http/routes/admin.routes";
import onionWalletRoutes from "./presentation/http/routes/wallet.routes";
import onionTransactionRoutes from "./presentation/http/routes/transaction.routes";
import onionReportRoutes from "./presentation/http/routes/report.routes";
import { setupSwaggerDocs } from "./infrastructure/docs/swagger";
import reviewRoutes from "./presentation/http/routes/review.routes";
import favoriteRoutes from "./presentation/http/routes/favorite.routes";

const app = express();

//Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
setupSwaggerDocs(app);
app.use("/api/auth", onionAuthRoutes);
app.use("/api/products", onionProductRoutes);
app.use("/api/financing", onionFinancingRoutes);
app.use("/api/orders", onionOrderRoutes);
app.use("/api/wallets", onionWalletRoutes);
app.use("/api/admin", onionAdminRoutes);
app.use("/api/transactions", onionTransactionRoutes);
app.use("/api/notifications", onionNotificationRoutes);
app.use("/api/upload", onionUploadRoutes);
app.use("/api/loans", onionLoanRoutes);
app.use("/api/reports", onionReportRoutes);
app.use("/api/queues", onionQueueRoutes);
app.use("/api/shipments", onionShipmentRoutes);
app.use("/api/chat", onionChatRoutes);
app.use("/api/push", onionPushRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);
app.get("/", (_req, res) => {
  res.send("Marketplace API Corriendo");
});

export default app;
