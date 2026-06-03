import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import financingRoutes from "./modules/financing/financing.routes";
import orderRoutes from "./modules/order/order.routes";
import walletRoutes from "./modules/wallet/wallet.routes";
import adminRoutes from "./modules/admin/admin.routes";
import transactionRoutes from "./modules/transaction/transaction.routes";
import notificationRoutes from "./modules/notification/notification.routes";
import uploadRoutes from "./modules/upload/upload.routes";
import loanRoutes from "./modules/loan/loan.routes";
import reportRoutes from "./modules/report/report.routes";
import queueRoutes from "./modules/queue/queue.routes";
import shipmentRoutes from "./modules/shipment/shipment.routes";
import chatRoutes from "./modules/chat/chat.routes";
import pushRoutes from "./modules/push/push.routes";
import onionProductRoutes from "./presentation/http/routes/product.routes";
import onionAuthRoutes from "./presentation/http/routes/auth.routes";
import onionOrderRoutes from "./presentation/http/routes/order.routes";

const app = express();

//Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", onionAuthRoutes);
app.use("/api/products", onionProductRoutes);
app.use("/api/financing", financingRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/v2/orders", onionOrderRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/push", pushRoutes);
app.get("/", (_req, res) => {
  res.send("Marketplace API Corriendo");
});

export default app;
