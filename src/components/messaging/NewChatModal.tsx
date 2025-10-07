import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/stores/use-chat-store';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
const newChatSchema = z.object({
  name: z.string().optional(),
  participantIds: z.array(z.string()).min(1, 'Please select at least one user.'),
});
type NewChatFormValues = z.infer<typeof newChatSchema>;
interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function NewChatModal({ isOpen, onClose }: NewChatModalProps) {
  const { users, loggedInUser, createChat } = useChatStore(state => ({
    users: state.users,
    loggedInUser: state.loggedInUser,
    createChat: state.createChat,
  }));
  const otherUsers = React.useMemo(() => users.filter(u => u.id !== loggedInUser?.id), [users, loggedInUser]);
  const form = useForm<NewChatFormValues>({
    resolver: zodResolver(newChatSchema),
    defaultValues: {
      name: '',
      participantIds: [],
    },
  });
  const selectedParticipantIds = form.watch('participantIds');
  const isGroupChat = selectedParticipantIds.length > 1;
  const onSubmit = async (data: NewChatFormValues) => {
    if (!loggedInUser) return;
    const allParticipantIds = [...data.participantIds, loggedInUser.id];
    const type = allParticipantIds.length > 2 ? 'group' : 'private';
    if (type === 'group' && (!data.name || data.name.trim().length === 0)) {
      form.setError('name', { type: 'manual', message: 'Group name is required for group chats.' });
      return;
    }
    try {
      await createChat({
        type,
        name: data.name,
        participantIds: allParticipantIds,
      });
      toast.success('Chat created successfully!');
      onClose();
      form.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Failed to create chat: ${errorMessage}`);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { form.reset(); onClose(); } }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Select users to start a private or group chat.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="participantIds"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Users</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value.length && "text-muted-foreground"
                          )}
                        >
                          <span className="truncate">
                            {field.value.length > 0
                              ? `${field.value.length} user${field.value.length > 1 ? 's' : ''} selected`
                              : "Select users"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search users..." />
                        <CommandList>
                          <CommandEmpty>No users found.</CommandEmpty>
                          <CommandGroup>
                            {otherUsers.map((user) => (
                              <CommandItem
                                value={user.name}
                                key={user.id}
                                onSelect={() => {
                                  const currentIds = field.value;
                                  const newIds = currentIds.includes(user.id)
                                    ? currentIds.filter((id) => id !== user.id)
                                    : [...currentIds, user.id];
                                  field.onChange(newIds);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value.includes(user.id) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {user.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="flex flex-wrap gap-1 pt-2">
                    {field.value.map(id => {
                      const user = users.find(u => u.id === id);
                      return user ? <Badge key={id} variant="secondary">{user.name}</Badge> : null;
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isGroupChat && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Group" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => { form.reset(); onClose(); }}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating...' : 'Create Chat'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}