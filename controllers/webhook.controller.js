import { processBotMessage } from "../services/bot.service.js";
import { sendMessage, resolveConversation } from "../services/chatwoot.service.js";
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
    content,
    id,
    contact
  } = req.body;

  const submittedValues = contentAttributes?.submitted_values;
  const conversationId = conversation?.id;
  const inboxIdentifier =
    conversation?.inbox?.identifier ||
    conversation?.contact_inbox?.inbox?.identifier ||
    req.body.inbox_identifier;

  const contactIdentifier =
    contact?.identifier ||
    conversation?.contact_inbox?.source_id ||
    req.body.contact_identifier;

  console.log("Webhook received:", {
    event,
    messageType,
    content,
    messageId: id,
    hasSubmittedValues: Boolean(submittedValues?.length),
    submittedValues,
    conversationId
  });

  if (
    (event === "contact_session_closed" || event === "contact_session_ended") &&
    conversationId
  ) {
    await resolveConversation({
      conversationId,
      inboxIdentifier,
      contactIdentifier
    });
    return;
  }

  if (event === "conversation_created" && conversationId) {
    await sendMessage(conversationId, MAIN_MENU.text, MAIN_MENU.buttons);
    return;
  }

  if (!MESSAGE_EVENTS.has(event)) return;

  const hasSubmittedValue = Boolean(contentAttributes?.submitted_values?.length);
  const isUserMessage = messageType === "incoming" || hasSubmittedValue;

  if (!isUserMessage) return;

  await processBotMessage(req.body);
}
