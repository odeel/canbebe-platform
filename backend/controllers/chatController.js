const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Baby = require("../models/Baby");
const Vaccination = require("../models/Vaccination");

const askGemini = require("../utils/gemini");
const buildContext = require("../utils/buildContext");
const isMedicalRisk = require("../utils/medicalCheck");

exports.sendMessage = async (req, res, next) => {
  try {
    const { message, conversationId, babyId, userId } = req.body;

    let conversation;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    } else {
      conversation = await Conversation.create({ userId, babyId });
    }

    await Message.create({
      conversationId: conversation._id,
      sender: "user",
      content: message,
    });

    const baby = await Baby.findById(babyId);
    const vaccination = await Vaccination.findOne({ babyId });

    const messages = await Message.find({
      conversationId: conversation._id,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    const context = buildContext({
      baby,
      vaccination,
      messages,
      summary: conversation.summary,
    });

    let aiResponse = await askGemini(context + "\nUser: " + message);

    if (isMedicalRisk(message)) {
      aiResponse += "\n\nCe sujet mérite un avis médical 🩺";
    }

    await Message.create({
      conversationId: conversation._id,
      sender: "ai",
      content: aiResponse,
    });

    conversation.messageCount += 1;
    conversation.lastMessageAt = new Date();

    // AUTO SUMMARY
    if (conversation.messageCount % 10 === 0) {
      const lastMessages = await Message.find({
        conversationId: conversation._id,
      })
        .sort({ createdAt: -1 })
        .limit(15);

      const summaryPrompt = `
Summarize key baby issues and concerns:
${lastMessages.map((m) => m.content).join("\n")}
`;

      const summary = await askGemini(summaryPrompt);

      conversation.summary = summary;
    }

    await conversation.save();

    res.json({
      success: true,
      reply: aiResponse,
      conversationId: conversation._id,
    });
  } catch (err) {
    next(err);
  }
};