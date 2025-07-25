import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { getSuggestedPromptById } from '@/lib/db/admin-queries';
import { PromptForm } from '../../components/prompt-form';

export default async function EditPromptPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
    redirect('/admin');
  }

  const prompt = await getSuggestedPromptById(params.id);
  
  if (!prompt) {
    redirect('/admin/prompts');
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Prompt</h1>
        <p className="text-muted-foreground">
          Update the suggested prompt details
        </p>
      </div>

      <PromptForm userId={session.user.id} prompt={prompt} />
    </div>
  );
}