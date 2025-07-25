import { auth } from '@/app/(auth)/auth';
import { createSuggestedPrompt } from '@/lib/db/admin-queries';
import { ChatSDKError } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return new ChatSDKError('forbidden:api', 'Admin access required').toResponse();
    }

    const { title, prompt, category, order, createdBy } = await request.json();

    if (!title || !prompt || !createdBy) {
      return new ChatSDKError('bad_request:api', 'Title, prompt, and createdBy are required').toResponse();
    }

    const newPrompt = await createSuggestedPrompt({
      title,
      prompt,
      category,
      order: order ?? 0,
      createdBy,
    });

    return Response.json({ prompt: newPrompt }, { status: 201 });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return new ChatSDKError('bad_request:api', 'Failed to create prompt').toResponse();
  }
}