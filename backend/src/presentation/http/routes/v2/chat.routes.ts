import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { ChatControllerV2 } from "../../controllers/chat/ChatControllerV2";

const router = Router();
const controller = new ChatControllerV2();

router.use(protect);
router.post("/conversations", authorize("CUSTOMER", "ADMIN"), controller.createConversation);
router.get("/conversations", controller.myConversations);
router.get("/conversations/admin", authorize("ADMIN"), controller.adminConversations);
router.get("/conversations/:conversationId/messages", controller.conversationMessages);
router.post("/conversations/:conversationId/messages", controller.sendConversationMessage);
router.patch("/conversations/:conversationId/read", controller.readConversation);

export default router;



