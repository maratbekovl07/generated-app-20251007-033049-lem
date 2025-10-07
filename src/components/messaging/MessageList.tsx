import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import type { Message } from '@shared/types';
import { useChatStore } from '@/stores/use-chat-store';
import { MessageSquareDashed } from 'lucide-react';
interface MessageListProps {
  messages: Message[];
}
export function MessageList({ messages }: MessageListProps) {
  const messageListRef = React.useRef<HTMLDivElement>(null);
  const users = useChatStore(state => state.users);
  const loggedInUser = useChatStore(state => state.loggedInUser);
  React.useEffect(() => {
    const scrollArea = messageListRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);
  if (!loggedInUser) return null;
  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
        <MessageSquareDashed className="h-16 w-16 text-muted-foreground/50" />
        <div className="space-y-1">
          <h3 className="text-xl font-semibold">No messages yet</h3>
          <p className="text-muted-foreground">
            Be the first one to send a message!
          </p>
        </div>
      </div>
    );
  }
  return (
    <ScrollArea className="flex-1" ref={messageListRef}>
      <div className="p-4 sm:p-6 space-y-4">
        {messages.map((message) => {
          const sender = users.find(u => u.id === message.senderId);
          return (
            <MessageBubble
              key={message.id}
              message={message}
              sender={sender}
              isOwnMessage={message.senderId === loggedInUser.id}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
}