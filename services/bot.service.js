import { getState, resetState, setCompleted, disableConversation, isConversationDisabled } from "../state/conversation.state.js";
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

  // Short-circuit: if bot is disabled due to agent assignment, ignore everything
  if (isConversationDisabled(conversationId)) return;

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
  if (!isConversationDisabled(conversationId) && message === "contact") {
    await sendMessage(
      conversationId,
      withMenuHint(
        "📧 support@driansh.com\n📞 +91-7028764776\n🌐 https://www.driansh.com"
      )
    );
    setCompleted(conversationId);
    return;
  }

  // If conversation is disabled or completed, ignore messages except explicit "menu"
  if (state.disabled) {
    // allow explicit "menu" to bring the bot back for this conversation
    if (message === "menu") {
      resetState(conversationId);
      await sendMessage(conversationId, MAIN_MENU.text, MAIN_MENU.buttons);
    }
    return;
  }

  if (state.step === "completed") {
    // allow user to explicitly reopen bot with "menu"
    if (message === "menu") {
      resetState(conversationId);
      await sendMessage(conversationId, MAIN_MENU.text, MAIN_MENU.buttons);
    }
    return;
  }

  // EXIT / RESET (user explicitly wants menu/main)
  if (message === "exit") {
    // keep exit behaviour: reset to main and show menu
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
        withMenuHint("Support team will contact you shortly.")
      );
      setCompleted(conversationId);
      return;
    }

    if (choice === "3") {
      await sendMessage(
        conversationId,
        withMenuHint("Book a demo: https://www.driansh.com/contact-us")
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
      withMenuHint(`✅ *${product.name}*\n${product.desc}\nMore info: ${product.link}\n`)
    );

    setCompleted(conversationId);
    return;
  }
}
