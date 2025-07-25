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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PlusIcon } from 'lucide-react';
import { PromptForm } from './prompt-form';
import type { SuggestedPrompt } from '@/lib/db/schema';

interface AddPromptDialogProps {
  userId: string;
  prompts: SuggestedPrompt[];
}

export function AddPromptDialog({ userId, prompts }: AddPromptDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const activePrompts = prompts.filter(prompt => prompt.isActive);
  const canAddMore = activePrompts.length < 4;

  const handleSuccess = () => {
    setOpen(false);
    // Small delay to ensure the server has processed the new prompt
    setTimeout(() => {
      router.refresh();
    }, 100);
  };

  const button = (
    <Button disabled={!canAddMore}>
      <PlusIcon className="mr-2 h-4 w-4" />
      Add Prompt
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              {!canAddMore ? (
                <span tabIndex={0}>
                  {button}
                </span>
              ) : (
                button
              )}
            </DialogTrigger>
          </TooltipTrigger>
          {!canAddMore && (
            <TooltipContent>
              <p>Maximum of 4 active prompts allowed</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Prompt</DialogTitle>
          <DialogDescription>
            {canAddMore 
              ? `Add a new suggested prompt for users (${activePrompts.length}/4 active)`
              : 'Maximum of 4 active prompts reached. Deactivate a prompt to add more.'}
          </DialogDescription>
        </DialogHeader>
        <PromptForm userId={userId} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}