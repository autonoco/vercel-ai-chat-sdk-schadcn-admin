import 'server-only';

import { count, desc, eq, not, like } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getDatabaseUrl } from '@/config/environments';
import {
  user,
  chat,
  message,
  suggestedPrompt,
  type SuggestedPrompt,
} from './schema';
import { ChatSDKError } from '../errors';

const client = postgres(getDatabaseUrl());
const db = drizzle(client);

// Admin Statistics
export async function getAdminStats() {
  try {
    const [users, chats, messages, prompts] = await Promise.all([
      db.select({ count: count() }).from(user),
      db.select({ count: count() }).from(chat),
      db.select({ count: count() }).from(message),
      db.select({ count: count() }).from(suggestedPrompt).where(eq(suggestedPrompt.isActive, true)),
    ]);

    return {
      totalUsers: users[0]?.count ?? 0,
      totalChats: chats[0]?.count ?? 0,
      totalMessages: messages[0]?.count ?? 0,
      activePrompts: prompts[0]?.count ?? 0,
    };
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get admin stats');
  }
}

// User Management (Super Admin only)
export async function getAllUsers({
  limit = 10,
  offset = 0,
}: {
  limit?: number;
  offset?: number;
}) {
  try {
    const users = await db
      .select({
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(not(like(user.email, 'guest-%')))
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(user)
      .where(not(like(user.email, 'guest-%')));

    return {
      users,
      total,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get users');
  }
}

export async function updateUserRole({
  userId,
  role,
}: {
  userId: string;
  role: 'user' | 'admin' | 'super_admin';
}) {
  try {
    const [updatedUser] = await db
      .update(user)
      .set({ role, updatedAt: new Date() })
      .where(eq(user.id, userId))
      .returning();
    
    return updatedUser;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to update user role');
  }
}

// Suggested Prompts Management
export async function getAllSuggestedPrompts() {
  try {
    return await db
      .select()
      .from(suggestedPrompt)
      .orderBy(suggestedPrompt.order, suggestedPrompt.createdAt);
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get suggested prompts');
  }
}

export async function getActiveSuggestedPrompts() {
  try {
    return await db
      .select()
      .from(suggestedPrompt)
      .where(eq(suggestedPrompt.isActive, true))
      .orderBy(suggestedPrompt.order, suggestedPrompt.createdAt);
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get active suggested prompts');
  }
}

export async function getSuggestedPromptById(id: string): Promise<SuggestedPrompt | null> {
  try {
    const [prompt] = await db
      .select()
      .from(suggestedPrompt)
      .where(eq(suggestedPrompt.id, id))
      .limit(1);
    
    return prompt || null;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get suggested prompt by id');
  }
}

export async function createSuggestedPrompt({
  title,
  prompt,
  category,
  order,
  createdBy,
}: {
  title: string;
  prompt: string;
  category?: string;
  order?: number;
  createdBy: string;
}) {
  try {
    const [newPrompt] = await db
      .insert(suggestedPrompt)
      .values({
        title,
        prompt,
        category,
        order: order ?? 0,
        createdBy,
      })
      .returning();
    
    return newPrompt;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create suggested prompt');
  }
}

export async function updateSuggestedPrompt({
  id,
  title,
  prompt,
  category,
  order,
  isActive,
}: {
  id: string;
  title?: string;
  prompt?: string;
  category?: string;
  order?: number;
  isActive?: boolean;
}) {
  try {
    const updates: any = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (prompt !== undefined) updates.prompt = prompt;
    if (category !== undefined) updates.category = category;
    if (order !== undefined) updates.order = order;
    if (isActive !== undefined) updates.isActive = isActive;

    const [updatedPrompt] = await db
      .update(suggestedPrompt)
      .set(updates)
      .where(eq(suggestedPrompt.id, id))
      .returning();
    
    return updatedPrompt;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to update suggested prompt');
  }
}

export async function deleteSuggestedPrompt({ id }: { id: string }) {
  try {
    const [deletedPrompt] = await db
      .delete(suggestedPrompt)
      .where(eq(suggestedPrompt.id, id))
      .returning();
    
    return deletedPrompt;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to delete suggested prompt');
  }
}

export async function reorderSuggestedPrompts(promptOrders: { id: string; order: number }[]) {
  try {
    const updates = promptOrders.map(({ id, order }) =>
      db
        .update(suggestedPrompt)
        .set({ order, updatedAt: new Date() })
        .where(eq(suggestedPrompt.id, id))
    );
    
    await Promise.all(updates);
    return { success: true };
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to reorder suggested prompts');
  }
}