import { getActiveSuggestedPrompts } from '@/lib/db/admin-queries';

export async function GET() {
  try {
    const prompts = await getActiveSuggestedPrompts();
    return Response.json(prompts, { status: 200 });
  } catch (error) {
    console.error('Error fetching suggested prompts:', error);
    return Response.json([], { status: 200 }); // Return empty array on error
  }
}