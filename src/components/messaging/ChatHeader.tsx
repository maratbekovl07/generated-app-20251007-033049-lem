import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreVertical, Phone, Search, Video } from 'lucide-react';
import type { Chat } from '@shared/types';
import { useChatStore } from '@/stores/use-chat-store';
interface ChatHeaderProps {
  chat: Chat;
}
export function ChatHeader({ chat }: ChatHeaderProps) {
  const loggedInUser = useChatStore(state => state.loggedInUser);
  const users = useChatStore(state => state.users);
  const getChatDetails = () => {
    if (chat.type === 'group') {
      const participantCount = chat.participantIds.length;
      return {
        name: chat.name,
        avatar: chat.avatar,
        description: `${participantCount} members`,
      };
    }
    const otherParticipantId = chat.participantIds.find(p => p !== loggedInUser?.id);
    const otherUser = users.find(u => u.id === otherParticipantId);
    return {
      name: otherUser?.name || 'Unknown User',
      avatar: otherUser?.avatar,
      description: 'Online', // Placeholder, online status not implemented
    };
  };
  const { name, avatar, description } = getChatDetails();
  return (
    <div className="flex h-16 flex-shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold">{name}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" disabled>
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" disabled>
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" disabled>
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" disabled>
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}