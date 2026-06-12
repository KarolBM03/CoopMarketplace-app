import { Router } from "express";
import { CooperativeController } from "../controllers/cooperative/CooperativeController";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validateBody } from "../middlewares/validateRequest";
import { cooperativeLimiter } from "../middlewares/rateLimit.middleware";
import {
  approveCooperativeLoanSchema,
  createCooperativeLoanApplicationSchema,
  createInterbankTransactionSchema,
  payCooperativeInstallmentSchema,
  payCooperativeLoanSchema,
  simulateCooperativeEventSchema,
} from "../../../application/validators/cooperative/cooperative.validators";

const router = Router();
const controller = new CooperativeController();

router.use(cooperativeLimiter);
router.use(protect);
router.use(authorize("ADMIN"));

router.get("/health", controller.health);
router.post("/test-login", controller.testLogin);

router.get("/members/cedula/:cedula", controller.findMemberByCedula);
router.get("/members/:socioId", controller.memberDetail);
router.get("/members/:socioId/eligibility", controller.eligibility);

router.get("/loan-types", controller.loanTypes);
router.post(
  "/loan-applications",
  validateBody(createCooperativeLoanApplicationSchema),
  controller.createLoanApplication,
);
router.post(
  "/loan-applications/approve",
  validateBody(approveCooperativeLoanSchema),
  controller.approveLoan,
);
router.get(
  "/loan-applications/:solicitudPrestamoId",
  controller.loanApplication,
);
router.get(
  "/loan-applications/:solicitudPrestamoId/history",
  controller.loanApplicationHistory,
);

router.post(
  "/payments/loan",
  validateBody(payCooperativeLoanSchema),
  controller.payLoan,
);
router.post(
  "/payments/installment",
  validateBody(payCooperativeInstallmentSchema),
  controller.payInstallment,
);
router.get("/payments/global", controller.loanGlobalPayments);
router.get("/payments/details", controller.paymentDetails);
router.get("/payments/by-installment", controller.paymentsByInstallment);

router.post(
  "/interbank/transactions",
  validateBody(createInterbankTransactionSchema),
  controller.createInterbankTransaction,
);
router.get("/interbank/transactions", controller.interbankTransactions);
router.post(
  "/financings/:financingId/simulate-event",
  validateBody(simulateCooperativeEventSchema),
  controller.simulateFinancingEvent,
);

export default router;
