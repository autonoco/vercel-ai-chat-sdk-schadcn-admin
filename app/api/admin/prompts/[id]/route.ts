import { auth } from '@/app/(auth)/auth';
import { updateSuggestedPrompt, deleteSuggestedPrompt } from '@/lib/db/admin-queries';
import { ChatSDKError } from '@/lib/errors';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return new ChatSDKError('forbidden:api', 'Admin access required').toResponse();
    }

    const { id } = await params;
    const data = await request.json();
    const { title, prompt, category, order, isActive } = data;

    const updatedPrompt = await updateSuggestedPrompt({
      id,
      title,
      prompt,
      category,
      order,
      isActive,
    });

    return Response.json({ prompt: updatedPrompt }, { status: 200 });
  } catch (error) {
    console.error('Error updating prompt:', error);
    return new ChatSDKError('internal:api', 'Failed to update prompt').toResponse();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return new ChatSDKError('forbidden:api', 'Admin access required').toResponse();
    }

    const { id } = await params;
    const deletedPrompt = await deleteSuggestedPrompt({ id });

    return Response.json({ prompt: deletedPrompt }, { status: 200 });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return new ChatSDKError('internal:api', 'Failed to delete prompt').toResponse();
  }
}