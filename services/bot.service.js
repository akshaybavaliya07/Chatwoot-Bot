import { getState, resetState } from "../state/conversation.state.js";
import { sendMessage } from "./chatwoot.service.js";
import {
  MAIN_MENU,
  PRODUCTS_MENU,
  PRODUCT_INFO
} from "../menus/main.menu.js";

function extractUserInput(body) {
  const submission = body.content_attributes?.submitted_values?.[0];
  const submittedText = submission?.value ?? submission?.title;
  const raw = (submittedText ?? body.content ?? "").trim();

  return {
    raw,
    normalized: raw.toLowerCase()
  };
}

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

export async function processBotMessage(body) {
  const conversationId = body.conversation?.id;

  if (conversationId == null) {
    console.warn("processBotMessage skipped: missing conversation id");
    return;
  }

  const { raw: rawMessage, normalized: message } = extractUserInput(body);
  const state = getState(conversationId);

  // EXIT / RESET
  if (message === "exit") {
    resetState(conversationId);
    await sendMessage(conversationId, MAIN_MENU.text, MAIN_MENU.buttons);
    return;
  }

  // CONTACT KEYWORD WORKS FROM ANYWHERE
  if (message === "contact") {
    resetState(conversationId);
    await sendMessage(
      conversationId,
      "📧 support@driansh.com\n📞 +91-7028764776\n🌐 https://www.driansh.com"
    );
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
      await sendMessage(conversationId, "Support team will contact you shortly.");
      return;
    }

    if (choice === "3") {
      await sendMessage(conversationId, "Book a demo: https://www.driansh.com/contact-us");
      return;
    }

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
      `✅ *${product.name}*\n${product.desc}\nMore info: ${product.link}\n`
    );

    resetState(conversationId);
    return;
  }
}

