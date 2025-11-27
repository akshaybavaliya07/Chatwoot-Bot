const conversationStates = new Map();

function normalizeId(conversationId) {
  if (conversationId == null) return null;
  return conversationId.toString();
}

export function getState(conversationId) {
  const key = normalizeId(conversationId);
  if (!key) return { step: "main" };

  if (!conversationStates.has(key)) {
    conversationStates.set(key, { step: "main" });
  }
  return conversationStates.get(key);
}

export function resetState(conversationId) {
  const key = normalizeId(conversationId);
  if (!key) return;
  conversationStates.set(key, { step: "main" });
}
