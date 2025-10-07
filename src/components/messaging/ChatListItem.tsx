import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Chat, User, MessageContent } from '@shared/types';
import { Badge } from '@/components/ui/badge';
import { useChatStore } from '@/stores/use-chat-store';
interface ChatListItemProps {
  chat: Chat;
  users: User[];
  loggedInUserId: string;
  isSelected: boolean;
  onSelect: () => void;
}
function getLastMessageText(content: MessageContent | undefined): string {
  if (!content) return 'No messages yet';
  switch (content.type) {
    case 'text':
      return content.text;
    case 'image':
      return '📷 Image';
    case 'file':
      return `📄 ${content.fileName}`;
    default:
      return '...';
  }
}
export function ChatListItem({ chat, users, loggedInUserId, isSelected, onSelect }: ChatListItemProps) {
  const unreadCount = useChatStore(state => state.unreadCounts[chat.id] || 0);
  const getChatDetails = () => {
    if (chat.type === 'group') {
      return { name: chat.name || 'Group Chat', avatar: chat.avatar };
    }
    const otherParticipantId = chat.participantIds.find(p => p !== loggedInUserId);
    const otherUser = users.find(u => u.id === otherParticipantId);
    return { name: otherUser?.name || 'Unknown User', avatar: otherUser?.avatar };
  };
  const { name, avatar } = getChatDetails();
  const lastMessage = chat.messages?.[chat.messages.length - 1];
  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors duration-200 hover:bg-muted',
        isSelected && 'bg-primary/10 dark:bg-primary/20 hover:bg-primary/10 dark:hover:bg-primary/20'
      )}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-baseline justify-between">
          <p className="truncate font-semibold">{name}</p>
          {lastMessage && (
            <p className="text-xs text-muted-foreground">
              {format(new Date(lastMessage.timestamp), 'p')}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="truncate text-sm text-muted-foreground">
            {getLastMessageText(lastMessage?.content)}
          </p>
          {unreadCount > 0 && (
            <Badge className="h-5 w-5 shrink-0 justify-center rounded-full p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}