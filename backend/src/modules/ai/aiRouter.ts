import { Router } from "express";
import chatWithAI from "./aiService";
import authenticationToken from "@common/middleware/authenticationToken";

const router = Router();

// POST /api/ai/chat
router.post("/chat", authenticationToken, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const companyId = req.token?.payload?.companyId;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found",
      });
    }

    // Call AI service
    const result = await chatWithAI(message, companyId, conversationHistory);

    return res.json({
      success: true,
      responseObject: result,
    });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process chat message",
    });
  }
});

export default router;
