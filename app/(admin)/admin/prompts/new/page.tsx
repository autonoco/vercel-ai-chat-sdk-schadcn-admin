import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { PromptForm } from '../components/prompt-form';

export default async function NewPromptPage() {
  const session = await auth();
  
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
    redirect('/admin');
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Prompt</h1>
        <p className="text-muted-foreground">
          Add a new suggested prompt for users
        </p>
      </div>

      <PromptForm userId={session.user.id} />
    </div>
  );
}