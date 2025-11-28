import axios from "axios";

export async function sendMessage(conversationId, content, buttons = []) {
  if (!conversationId) {
    console.warn("sendMessage skipped: missing conversationId");
    return;
  }

  if (!content) {
    console.warn("sendMessage skipped: missing content");
    return;
  }

  const ACCOUNT_ID = process.env.ACCOUNT_ID;
  const CHATWOOT_TOKEN = process.env.CHATWOOT_TOKEN;

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