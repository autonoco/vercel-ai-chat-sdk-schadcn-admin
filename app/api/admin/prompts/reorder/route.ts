import { auth } from '@/app/(auth)/auth';
import { reorderSuggestedPrompts } from '@/lib/db/admin-queries';
import { ChatSDKError } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return new ChatSDKError('forbidden:api', 'Admin access required').toResponse();
    }

    const { prompts } = await request.json();

    if (!prompts || !Array.isArray(prompts)) {
      return new ChatSDKError('bad_request:api', 'Invalid prompts data').toResponse();
    }

    await reorderSuggestedPrompts(prompts);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error reordering prompts:', error);
    return new ChatSDKError('internal:api', 'Failed to reorder prompts').toResponse();
  }
}