import React from 'react';
import { ChatListItem } from './ChatListItem';
import { useChatStore } from '@/stores/use-chat-store';
interface ChatListProps {
  searchQuery: string;
}
export function ChatList({ searchQuery }: ChatListProps) {
  const chats = useChatStore(state => state.chats);
  const selectedChat = useChatStore(state => state.selectedChat);
  const selectChat = useChatStore(state => state.selectChat);
  const loggedInUser = useChatStore(state => state.loggedInUser);
  const users = useChatStore(state => state.users);
  const filteredChats = React.useMemo(() => {
    if (!searchQuery) return chats;
    const lowercasedQuery = searchQuery.toLowerCase();
    return chats.filter(chat => {
      if (chat.type === 'group' && chat.name) {
        return chat.name.toLowerCase().includes(lowercasedQuery);
      }
      if (chat.type === 'private') {
        const otherParticipantId = chat.participantIds.find(p => p !== loggedInUser?.id);
        const otherUser = users.find(u => u.id === otherParticipantId);
        return otherUser?.name.toLowerCase().includes(lowercasedQuery);
      }
      return false;
    });
  }, [chats, searchQuery, users, loggedInUser]);
  if (!loggedInUser) return null;
  return (
    <div className="flex flex-col gap-1 px-4">
      {filteredChats
        .slice() // Create a shallow copy to avoid mutating the original array
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          users={users}
          loggedInUserId={loggedInUser.id}
          isSelected={chat.id === selectedChat?.id}
          onSelect={() => selectChat(chat.id)}
        />
      ))}
    </div>
  );
}