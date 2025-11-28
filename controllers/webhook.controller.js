import { processBotMessage } from "../services/bot.service.js";
import { sendMessage } from "../services/chatwoot.service.js";
import { MAIN_MENU } from "../menus/main.menu.js";
import {
  disableConversation,
  resetState,
  isConversationDisabled
} from "../state/conversation.state.js";

/**
 * Handles incoming Chatwoot webhook events.
 * Key responsibilities:
 * - Send initial menu on new conversation
 * - Disable bot on human agent intervention
 * - Process user messages and button clicks
 */
export async function handleWebhook(req, res) {
  res.sendStatus(200); // Acknowledge immediately to prevent chatwoot retries

  const body = req.body ?? {};
  const {
    event,
    message_type: messageType,
    content_attributes: contentAttributes,
    conversation,
    sender
  } = body;

  const conversationId = conversation?.id;

  // ✅ New conversation → reset state & send main menu
  if (event === "conversation_created" && conversationId) {
    resetState(conversationId);
    await sendMessage(conversationId, MAIN_MENU.text, MAIN_MENU.buttons);
    return;
  }

  // ✅ If human agent is assigned → permanently disable bot
  if (conversation?.meta?.assignee && conversationId) {
    disableConversation(conversationId);
    return;
  }

  // ✅ Human agent sends any message → permanently disable bot
  if (
    messageType === "outgoing" &&
    sender?.type === "agent" &&
    conversationId
  ) {
    disableConversation(conversationId);
    return;
  }

  // ✅ Terminal state check → skip bot if disabled
  if (conversationId && isConversationDisabled(conversationId)) {
    return;
  }

  // ✅ Check for user input: normal message or button click
  const hasSubmittedValue = Boolean(contentAttributes?.submitted_values?.length);
  const isUserMessage =
    messageType === "incoming" || // normal text
    hasSubmittedValue; // ✅ BUTTON CLICKS COME HERE (message_updated)
  // ACCEPT BOTH message_created AND message_updated FOR BUTTONS
  if (!isUserMessage) return;

  await processBotMessage(body);
}
