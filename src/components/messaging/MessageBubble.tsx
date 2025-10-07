import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Message, User, Chat } from '@shared/types';
import { Check, CheckCheck } from 'lucide-react';
import { useChatStore } from '@/stores/use-chat-store';
interface MessageBubbleProps {
  message: Message;
  sender?: User;
  isOwnMessage: boolean;
}
function MessageContentDisplay({ content }: { content: Message['content'] }) {
    switch (content.type) {
        case 'text':
            return <p className="text-sm break-words">{content.text}</p>;
        case 'image':
            return <img src={content.url} alt="sent image" className="max-w-xs rounded-md" />;
        case 'file':
            return (
                <a href={content.url} target="_blank" rel="noopener noreferrer" className="text-sm underline">
                    {content.fileName} ({Math.round(content.fileSize / 1024)} KB)
                </a>
            );
        default:
            return <p className="text-sm italic text-muted-foreground">[Unsupported message type]</p>;
    }
}
function ReadReceipt({ message, chat }: { message: Message, chat: Chat | null }) {
    if (!chat) return null;
    const otherParticipantIds = chat.participantIds.filter(id => id !== message.senderId);
    if (otherParticipantIds.length === 0) return null;
    const allRead = otherParticipantIds.every(id => {
        const lastRead = chat.lastReadTimestamp?.[id];
        return lastRead && lastRead >= message.timestamp;
    });
    if (allRead) {
        return <CheckCheck className="h-4 w-4 text-blue-400" />;
    }
    return <Check className="h-4 w-4 text-muted-foreground/80" />;
}
export function MessageBubble({ message, sender, isOwnMessage }: MessageBubbleProps) {
  const selectedChat = useChatStore(state => state.selectedChat);
  return (
    <div
      className={cn(
        'flex items-end gap-2',
        isOwnMessage ? 'justify-end' : 'justify-start'
      )}
    >
      {!isOwnMessage && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={sender?.avatar} alt={sender?.name} />
          <AvatarFallback>{sender?.name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'group relative max-w-xs rounded-lg px-3 py-2 lg:max-w-md',
          isOwnMessage
            ? 'rounded-br-none bg-primary text-primary-foreground'
            : 'rounded-bl-none bg-muted'
        )}
      >
        <MessageContentDisplay content={message.content} />
        <div className="flex items-center justify-end gap-1 pt-1">
            <span className="text-2xs text-primary-foreground/60 dark:text-primary-foreground/50">
                {format(new Date(message.timestamp), 'p')}
            </span>
            {isOwnMessage && <ReadReceipt message={message} chat={selectedChat} />}
        </div>
      </div>
    </div>
  );
}