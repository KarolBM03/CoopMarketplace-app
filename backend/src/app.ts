import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import onionUploadRoutes from "./presentation/http/routes/v2/upload.routes";
import onionLoanRoutes from "./presentation/http/routes/v2/loan.routes";
import onionQueueRoutes from "./presentation/http/routes/v2/queue.routes";
import onionAuthRoutes from "./presentation/http/routes/v2/auth.routes";
import onionProductRoutes from "./presentation/http/routes/v2/product.routes";
import onionOrderRoutes from "./presentation/http/routes/v2/order.routes";
import onionFinancingRoutes from "./presentation/http/routes/v2/financing.routes";
import onionShipmentRoutes from "./presentation/http/routes/v2/shipment.routes";
import onionChatRoutes from "./presentation/http/routes/v2/chat.routes";
import onionNotificationRoutes from "./presentation/http/routes/v2/notification.routes";
import onionPushRoutes from "./presentation/http/routes/v2/push.routes";
import onionAdminRoutes from "./presentation/http/routes/v2/admin.routes";
import onionWalletRoutes from "./presentation/http/routes/v2/wallet.routes";
import onionTransactionRoutes from "./presentation/http/routes/v2/transaction.routes";
import onionReportRoutes from "./presentation/http/routes/v2/report.routes";

const app = express();

//Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", onionAuthRoutes);
app.use("/api/v2/auth", onionAuthRoutes);
app.use("/api/products", onionProductRoutes);
app.use("/api/v2/products", onionProductRoutes);
app.use("/api/financing", onionFinancingRoutes);
app.use("/api/v2/financing", onionFinancingRoutes);
app.use("/api/orders", onionOrderRoutes);
app.use("/api/v2/orders", onionOrderRoutes);
app.use("/api/wallets", onionWalletRoutes);
app.use("/api/v2/wallets", onionWalletRoutes);
app.use("/api/admin", onionAdminRoutes);
app.use("/api/v2/admin", onionAdminRoutes);
app.use("/api/transactions", onionTransactionRoutes);
app.use("/api/v2/transactions", onionTransactionRoutes);
app.use("/api/notifications", onionNotificationRoutes);
app.use("/api/v2/notifications", onionNotificationRoutes);
app.use("/api/upload", onionUploadRoutes);
app.use("/api/v2/upload", onionUploadRoutes);
app.use("/api/loans", onionLoanRoutes);
app.use("/api/v2/loans", onionLoanRoutes);
app.use("/api/reports", onionReportRoutes);
app.use("/api/v2/reports", onionReportRoutes);
app.use("/api/queues", onionQueueRoutes);
app.use("/api/v2/queues", onionQueueRoutes);
app.use("/api/shipments", onionShipmentRoutes);
app.use("/api/v2/shipments", onionShipmentRoutes);
app.use("/api/chat", onionChatRoutes);
app.use("/api/v2/chat", onionChatRoutes);
app.use("/api/push", onionPushRoutes);
app.use("/api/v2/push", onionPushRoutes);
app.get("/", (_req, res) => {
  res.send("Marketplace API Corriendo");
});

export default app;



