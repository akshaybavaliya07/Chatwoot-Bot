import axios from "axios";

const ACCOUNT_ID = 141109;
const CHATWOOT_TOKEN = "syt2TK6pRifiQemYXwm95RNR";

export async function sendMessage(conversationId, content, buttons = []) {
  if (!conversationId) {
    console.warn("sendMessage skipped: missing conversationId");
    return;
  }

  if (!content) {
    console.warn("sendMessage skipped: missing content");
    return;
  }

  if (!CHATWOOT_TOKEN || !ACCOUNT_ID) {
    console.warn("sendMessage skipped: missing CHATWOOT_TOKEN or ACCOUNT_ID");
    return;
  }

  const payload = {
    content,
    message_type: "outgoing"
  };

  if (buttons.length) {
    payload.content_type = "input_select";
    payload.content_attributes = {
      items: buttons.map((button) => {
        const title = button.title;
        const value = button.payload;

        return { title, value };
      })
    };
  }

  try {
    await axios.post(
      `https://app.chatwoot.com/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/messages`,
      payload,
      { headers: { api_access_token: CHATWOOT_TOKEN } }
    );
  } catch (err) {
    console.error("Chatwoot Send Error:", err.response?.data || err.message);
  }
}

export async function resolveConversation({
  conversationId,
  inboxIdentifier,
  contactIdentifier
}) {
  if (!CHATWOOT_TOKEN) {
    console.warn("resolveConversation skipped: missing CHATWOOT_TOKEN");
    return;
  }

  if (!conversationId || !inboxIdentifier || !contactIdentifier) {
    console.warn(
      "resolveConversation skipped: missing conversationId, inboxIdentifier or contactIdentifier",
      { conversationId, inboxIdentifier, contactIdentifier }
    );
    return;
  }

  const url = `https://app.chatwoot.com/public/api/v1/inboxes/${inboxIdentifier}/contacts/${contactIdentifier}/conversations/${conversationId}/toggle_status`;

  try {
    await axios.post(
      url,
      { status: "resolved" },
      { headers: { api_access_token: CHATWOOT_TOKEN } }
    );
  } catch (err) {
    console.error(
      "Chatwoot Resolve Error:",
      err.response?.data || err.message,
      { url }
    );
  }
}
