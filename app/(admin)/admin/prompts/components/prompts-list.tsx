'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import type { SuggestedPrompt } from '@/lib/db/schema';
import { Trash2, GripVertical } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EditPromptDialog } from './edit-prompt-dialog';

interface PromptsListProps {
  prompts: SuggestedPrompt[];
  userId: string;
}

// Sortable row component
function SortableRow({ 
  prompt, 
  userId, 
  isUpdating, 
  onToggleActive, 
  onDelete 
}: { 
  prompt: SuggestedPrompt;
  userId: string;
  isUpdating: string | null;
  onToggleActive: (promptId: string, isActive: boolean) => void;
  onDelete: (promptId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: prompt.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`${!prompt.isActive ? 'opacity-60' : ''} ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <TableCell>
        <div className="flex items-center gap-2">
          <button
            className="cursor-move touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4 text-muted-foreground" />
          </button>
          <span className="text-sm">{prompt.order}</span>
        </div>
      </TableCell>
      <TableCell className="font-medium">{prompt.title}</TableCell>
      <TableCell className="max-w-md">
        <span className="text-sm text-muted-foreground line-clamp-2">
          {prompt.prompt}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <Switch
          checked={prompt.isActive}
          onCheckedChange={(checked) => onToggleActive(prompt.id, checked)}
          disabled={isUpdating === prompt.id}
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <EditPromptDialog
            prompt={prompt}
            userId={userId}
            disabled={isUpdating === prompt.id}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={isUpdating === prompt.id}
              >
                <Trash2 className="size-4" />
                <span className="sr-only">Delete prompt</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  prompt &quot;{prompt.title}&quot; from the system.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(prompt.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function PromptsList({ prompts, userId }: PromptsListProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [items, setItems] = useState(prompts);
  
  // Update items when prompts prop changes
  useEffect(() => {
    setItems(prompts);
  }, [prompts]);
  
  // Setup drag and drop sensors
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleToggleActive = async (promptId: string, isActive: boolean) => {
    // Check if we're trying to activate and already have 4 active prompts
    if (isActive) {
      const activeCount = items.filter(p => p.isActive && p.id !== promptId).length;
      if (activeCount >= 4) {
        toast.error('Maximum of 4 active prompts allowed');
        return;
      }
    }

    setIsUpdating(promptId);
    
    try {
      const response = await fetch(`/api/admin/prompts/${promptId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update prompt');
      }

      toast.success(`Prompt ${isActive ? 'activated' : 'deactivated'}`);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update prompt');
      console.error(error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (promptId: string) => {
    setIsUpdating(promptId);
    
    try {
      const response = await fetch(`/api/admin/prompts/${promptId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete prompt');
      }

      toast.success('Prompt deleted successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete prompt');
      console.error(error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Update local state immediately for smooth UX
    const newItems = arrayMove(items, oldIndex, newIndex);
    
    // Update order values
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index
    }));
    
    setItems(updatedItems);

    // Prepare order updates for API
    const orderUpdates = updatedItems.map((item, index) => ({
      id: item.id,
      order: index
    }));

    try {
      // Call API to update order
      const response = await fetch('/api/admin/prompts/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompts: orderUpdates }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder prompts');
      }

      toast.success('Prompts reordered successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to reorder prompts');
      console.error(error);
      // Revert to original order on error
      setItems(prompts);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Prompt</TableHead>
              <TableHead className="text-center">Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No prompts found. Create your first prompt to get started.
                </TableCell>
              </TableRow>
            ) : (
              <SortableContext
                items={items.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((prompt) => (
                  <SortableRow
                    key={prompt.id}
                    prompt={prompt}
                    userId={userId}
                    isUpdating={isUpdating}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                  />
                ))}
              </SortableContext>
            )}
          </TableBody>
        </Table>
      </div>
    </DndContext>
  );
}