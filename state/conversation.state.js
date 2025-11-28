/**
 * In-memory conversation states.
 * Can be swapped with Redis for production persistence later.
 */
const conversationStates = new Map();

function normalizeId(conversationId) {
  if (conversationId == null) return null;
  return conversationId.toString();
}

export function getState(conversationId) {
  const key = normalizeId(conversationId);
  if (!key) return { step: "main", disabled: false };

  if (!conversationStates.has(key)) {
    conversationStates.set(key, { step: "main", disabled: false });
  }
  return conversationStates.get(key);
}

/**
 * Reset conversation to active main menu state.
 * Called when user types 'menu' or when a new conversation is created.
 */
export function resetState(conversationId) {
  const key = normalizeId(conversationId);
  if (!key) return;
  conversationStates.set(key, { step: "main", disabled: false });
}

/**
 * Mark the conversation as completed/terminal.
 * This stops the bot from replying automatically until user types 'menu' or a new conversation is created.
 */
export function setCompleted(conversationId) {
  const key = normalizeId(conversationId);
  if (!key) return;
  const existing = conversationStates.get(key) ?? {};
  conversationStates.set(key, { ...existing, step: "completed", disabled: false });
}

/**
 * Permanently disable the bot for this conversation (agent override).
 * When disabled: bot will not respond again in this conversation.
 */
export function disableConversation(conversationId) {
  const key = normalizeId(conversationId);
  if (!key) return;

  // added code: hard lock + disabled flag for reliable blocking
  conversationStates.set(key, {
    step: "disabled",
    locked: true,
    disabled: true
  });
}

/**
 * Convenience check used by controller to short-circuit processing.
 */
export function isConversationDisabled(conversationId) {
  const key = normalizeId(conversationId);
  const state = conversationStates.get(key);

  // added code: support both locked and disabled flags
  return state?.step === "disabled" && state?.locked === true;
}
