'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Pencil } from 'lucide-react';
import { PromptForm } from './prompt-form';
import type { SuggestedPrompt } from '@/lib/db/schema';

interface EditPromptDialogProps {
  prompt: SuggestedPrompt;
  userId: string;
  disabled?: boolean;
}

export function EditPromptDialog({ prompt, userId, disabled }: EditPromptDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
    // Small delay to ensure the server has processed the update
    setTimeout(() => {
      router.refresh();
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
        >
          <Pencil className="size-4" />
          <span className="sr-only">Edit prompt</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Prompt</DialogTitle>
          <DialogDescription>
            Update the suggested prompt details
          </DialogDescription>
        </DialogHeader>
        <PromptForm userId={userId} prompt={prompt} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}