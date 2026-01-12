import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

declare global {
  var __db__: PrismaClient;
}

// This is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// In production we'll have a single connection to the DB.
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient();
  }
  prisma = global.__db__;
  prisma.$connect();
}

export { prisma };

/**
 * Save a message to the database
 */
export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant" | "system",
  content: string
) {
  return await prisma.message.create({
    data: {
      conversationId,
      role,
      content,
    },
  });
}

/**
 * Get conversation history
 */
export async function getConversationHistory(conversationId: string) {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { timestamp: "asc" },
  });

  return messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}

/**
 * Create or get a conversation
 */
export async function getOrCreateConversation(
  shopId: string,
  customerId?: string
) {
  // Try to find existing conversation for this customer
  if (customerId) {
    const existing = await prisma.conversation.findFirst({
      where: {
        shopId,
        customerId,
      },
      orderBy: { updatedAt: "desc" },
    });

    if (existing) {
      return existing;
    }
  }

  // Create new conversation
  return await prisma.conversation.create({
    data: {
      shopId,
      customerId: customerId || null,
    },
  });
}

/**
 * Get store settings
 */
export async function getStoreSettings(shopId: string) {
  let settings = await prisma.storeSettings.findUnique({
    where: { shopId },
  });

  if (!settings) {
    settings = await prisma.storeSettings.create({
      data: { shopId },
    });
  }

  return settings;
}

/**
 * Update store settings
 */
export async function updateStoreSettings(
  shopId: string,
  data: { openaiKey?: string; systemPrompt?: string }
) {
  return await prisma.storeSettings.upsert({
    where: { shopId },
    update: data,
    create: {
      shopId,
      ...data,
    },
  });
}






