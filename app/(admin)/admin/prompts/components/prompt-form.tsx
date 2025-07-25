'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { SuggestedPrompt } from '@/lib/db/schema';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  prompt: z.string().min(1, 'Prompt is required'),
  category: z.string().optional(),
  order: z.number().min(0).default(0),
  isActive: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface PromptFormProps {
  userId: string;
  prompt?: SuggestedPrompt;
  onSuccess?: () => void;
}

export function PromptForm({ userId, prompt, onSuccess }: PromptFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: prompt?.title || '',
      prompt: prompt?.prompt || '',
      category: prompt?.category || '',
      order: prompt?.order || 0,
      isActive: prompt?.isActive ?? false,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const url = prompt 
        ? `/api/admin/prompts/${prompt.id}`
        : '/api/admin/prompts';
      
      const method = prompt ? 'PATCH' : 'POST';
      
      const body = prompt 
        ? data 
        : { ...data, createdBy: userId };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to save prompt');
      }

      toast.success(prompt ? 'Prompt updated successfully' : 'Prompt created successfully');
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/prompts');
        router.refresh();
      }
    } catch (error) {
      toast.error('Failed to save prompt');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="What are the advantages" {...field} />
              </FormControl>
              <FormDescription>
                The beginning of the prompt shown to users
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Prompt</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What are the advantages of using Next.js?" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                The complete prompt that will be sent when selected
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              </FormControl>
              <FormDescription>
                Display order (lower numbers appear first)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : prompt ? 'Update Prompt' : 'Create Prompt'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onSuccess) {
                // Reset form when in dialog mode
                form.reset();
                onSuccess();
              } else {
                router.push('/admin/prompts');
              }
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}