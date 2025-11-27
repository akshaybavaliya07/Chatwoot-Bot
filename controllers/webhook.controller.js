import { processBotMessage } from "../services/bot.service.js";
import { sendMessage } from "../services/chatwoot.service.js";
import { MAIN_MENU } from "../menus/main.menu.js";

const MESSAGE_EVENTS = new Set(["message_created", "message_updated"]);

export async function handleWebhook(req, res) {
  // Immediate acknowledgement to stop Chatwoot retries
  res.sendStatus(200);

  const {
    event,
    message_type: messageType,
    content_attributes: contentAttributes,
    conversation,
  } = req.body;

  const conversationId = conversation?.id;

  if (event === "conversation_created" && conversationId) {
    await sendMessage(conversationId, MAIN_MENU.text, MAIN_MENU.buttons);
    return;
  }

  if (!event === 'message_created') return;

  const hasSubmittedValue = Boolean(contentAttributes?.submitted_values?.length);
  const isUserMessage = messageType === "incoming" || hasSubmittedValue;

  if (!isUserMessage) return;

  await processBotMessage(req.body);
}
