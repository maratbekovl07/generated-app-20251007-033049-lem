import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useChatStore } from '@/stores/use-chat-store';
import { toast } from '@/components/ui/sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  avatar: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
});
type ProfileFormValues = z.infer<typeof profileSchema>;
interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const loggedInUser = useChatStore(state => state.loggedInUser);
  const updateUserProfile = useChatStore(state => state.updateUserProfile);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      avatar: '',
    },
  });
  React.useEffect(() => {
    if (loggedInUser) {
      form.reset({
        name: loggedInUser.name,
        avatar: loggedInUser.avatar || '',
      });
    }
  }, [loggedInUser, form, isOpen]);
  const onSubmit = async (data: ProfileFormValues) => {
    if (!loggedInUser) return;
    try {
      await updateUserProfile(loggedInUser.id, data);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Update failed: ${errorMessage}`);
    }
  };
  const avatarUrl = form.watch('avatar');
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl} alt={form.getValues('name')} />
                <AvatarFallback>{form.getValues('name')?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/avatar.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}