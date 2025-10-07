import React from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChatStore } from '@/stores/use-chat-store';
export function ChatView() {
  const selectedChat = useChatStore(state => state.selectedChat);
  if (!selectedChat) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/40">
        <p>Select a chat to view messages.</p>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col">
      <ChatHeader chat={selectedChat} />
      <MessageList messages={selectedChat.messages} />
      <MessageInput />
    </div>
  );
}