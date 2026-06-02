import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import {
  adminConversations,
  conversationMessages,
  createConversation,
  myConversations,
  readConversation,
  sendConversationMessage,
} from "./chat.controller";

const router = Router();

router.use(protect);
router.post(
  "/conversations",
  authorize("CUSTOMER", "ADMIN"),
  createConversation,
);
router.get("/conversations", myConversations);
router.get("/conversations/admin", authorize("ADMIN"), adminConversations);
router.get("/conversations/:conversationId/messages", conversationMessages);
router.post("/conversations/:conversationId/messages", sendConversationMessage);
router.patch("/conversations/:conversationId/read", readConversation);

export default router;
