import { getQwenChatResponse } from '../services/ai/qwenService.js';
import UserProfile from '../models/UserProfile.js';

export const handleChat = async (req, res, next) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid messages array with user query is required.',
      });
    }

    // Retrieve user profile if logged in
    let userProfile = null;
    if (req.user) {
      userProfile = await UserProfile.findOne({ userId: req.user._id }).lean();
    }

    const aiResponse = await getQwenChatResponse({
      messages,
      userProfile,
    });

    return res.status(200).json({
      success: true,
      message: aiResponse.text,
      provider: aiResponse.provider,
      matchedSchemes: aiResponse.matchedSchemes || [],
    });
  } catch (error) {
    console.error('Chat Assistant Error:', error);
    next(error);
  }
};
