import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { getAllSuggestedPrompts } from '@/lib/db/admin-queries';
import { PromptsList } from './components/prompts-list';
import { AddPromptDialog } from './components/add-prompt-dialog';

export default async function PromptsPage() {
  const session = await auth();
  
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
    redirect('/admin');
  }

  const prompts = await getAllSuggestedPrompts();

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h2 className="text-lg font-semibold">Manage Suggested Prompts</h2>
          <p className="text-sm text-muted-foreground">
            These prompts appear as suggestions in the chat interface (max 4 active)
          </p>
        </div>
        <AddPromptDialog userId={session.user.id} prompts={prompts} />
      </div>
      <div className="px-4 lg:px-6">
        <PromptsList prompts={prompts} userId={session.user.id} />
      </div>
    </div>
  );
}