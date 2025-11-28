import {
  getState,
  resetState,
  setCompleted,
  disableConversation,
  isConversationDisabled
} from "../state/conversation.state.js";
import { sendMessage } from "./chatwoot.service.js";
import {
  MAIN_MENU,
  PRODUCTS_MENU,
  PRODUCT_INFO
} from "../menus/main.menu.js";

/**
 * Extracts user text from message body.
 * Handles both text messages and button clicks (submitted values).
 */
function extractUserInput(body) {
  const submission = body.content_attributes?.submitted_values?.[0];
  const submittedText = submission?.value ?? submission?.title;
  const raw = (submittedText ?? body.content ?? "").trim();

  return {
    raw,
    normalized: raw.toLowerCase()
  };
}

/**
 * Matches user input against available button choices.
 */
function matchButtonChoice(input, buttons) {
  if (!input || !buttons?.length) return null;
  const normalized = input.toLowerCase();

  const match = buttons.find((button) => {
    const value = button.payload ?? button.value;
    const title = button.title ?? button.label;

    return (
      value?.toString().toLowerCase() === normalized ||
      title?.toString().toLowerCase() === normalized
    );
  });

  return match ? (match.payload ?? match.value) : null;
}

// Appends a hint about returning to the main menu.
function withMenuHint(message) {
  return `${message}\n\n💡 Type 'menu' to return to the main menu.`;
}

/**
 * Core bot message processing logic.
 * Handles main menu, products menu, and terminal commands like 'exit' or 'contact'.
 */
export async function processBotMessage(body) {
  const conversationId = body.conversation?.id;

  if (conversationId == null) {
    console.warn("processBotMessage skipped: missing conversation id");
    return;
  }

  // added code: HARD STOP if agent has taken over
  if (isConversationDisabled(conversationId)) {
    console.log("Bot blocked: agent is active on conversation", conversationId);
    return;
  }

  // If webhook indicates an agent sent an outgoing message, ensure bot is disabled
  // (controller already handles most cases, but keep a safety net here)
  const senderIsAgent = body.sender?.type === "agent";
  if (body.message_type === "outgoing" && senderIsAgent) {
    disableConversation(conversationId);
    return;
  }

  const { raw: rawMessage, normalized: message } = extractUserInput(body);
  const state = getState(conversationId);

  // CONTACT KEYWORD WORKS FROM ANYWHERE except if conversation is disabled
  if (message === "contact") {
    if (isConversationDisabled(conversationId)) return; // added code: strict agent lock

    await sendMessage(
      conversationId,
      withMenuHint(
        "📧 support@driansh.com\n📞 +91-7028764776\n🌐 https://www.driansh.com"
      )
    );
    setCompleted(conversationId);
    return;
  }

  if (state.step === "completed") {
      if (message === "menu") {
        resetState(conversationId);
        await sendMessage(conversationId, MAIN_MENU.text, MAIN_MENU.buttons);
      }
    return;
  }

  // EXIT / RESET (user explicitly wants menu/main)
  if (message === "exit" || message === "menu") {
    resetState(conversationId);
    await sendMessage(conversationId, MAIN_MENU.text, MAIN_MENU.buttons);
    return;
  }

  // MAIN MENU FLOW
  if (state.step === "main") {
    const choice = matchButtonChoice(rawMessage, MAIN_MENU.buttons) || message;

    if (choice === "1") {
      state.step = "products";
      await sendMessage(conversationId, PRODUCTS_MENU.text, PRODUCTS_MENU.buttons);
      return;
    }

    if (choice === "2") {
      await sendMessage(
        conversationId,
        withMenuHint(
          "💬 Our support team is here to assist you!\n\n" +
          "📧 Email: support@driansh.com\n" +
          "📞 Phone: +91-7028764776\n" +
          "🌐 Contact Page: https://www.driansh.com/contact-us\n\n" +
          "Please reach out and we will get back to you as soon as possible."
        )
      );
      setCompleted(conversationId);
      return;
    }

    if (choice === "3") {
      await sendMessage(
        conversationId,
        withMenuHint(
          "🚀 Interested in seeing our platform in action?\n\n" +
          "You can book a personalized demo with our team here:\n" +
          "🌐 Book Demo: https://www.driansh.com/contact-us\n\n" +
          "We’ll guide you through all features and answer your questions!"
        )
      );
      setCompleted(conversationId);
      return;
    }

    // unknown main menu command -> re-show main menu
    await sendMessage(conversationId, MAIN_MENU.text, MAIN_MENU.buttons);
    return;
  }

  // PRODUCTS FLOW
  if (state.step === "products") {
    const productKey =
      matchButtonChoice(rawMessage, PRODUCTS_MENU.buttons) || message;
    const product = PRODUCT_INFO[productKey];

    if (!product) {
      await sendMessage(
        conversationId,
        "Please select a valid product:",
        PRODUCTS_MENU.buttons
      );
      return;
    }

    await sendMessage(
      conversationId,
      withMenuHint(
        `✅ *${product.name}*\n${product.desc}\nMore info: ${product.link}\n`
      )
    );

    setCompleted(conversationId);
    return;
  }
}
