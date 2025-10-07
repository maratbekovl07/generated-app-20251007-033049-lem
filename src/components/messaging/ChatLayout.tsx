import React from 'react';
import { Sidebar } from './Sidebar';
import { ChatView } from './ChatView';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useChatStore } from '@/stores/use-chat-store';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster, toast } from '@/components/ui/sonner';
export function ChatLayout() {
  const fetchInitialData = useChatStore(state => state.fetchInitialData);
  const isLoading = useChatStore(state => state.isLoading);
  const error = useChatStore(state => state.error);
  const selectedChat = useChatStore(state => state.selectedChat);
  const loggedInUser = useChatStore(state => state.loggedInUser);
  React.useEffect(() => {
    if (loggedInUser) {
      fetchInitialData();
    }
  }, [loggedInUser, fetchInitialData]);
  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-stretch">
        <Skeleton className="w-[25%] min-w-[280px] max-w-[400px]" />
        <Skeleton className="flex-1" />
      </div>
    );
  }
  return (
    <>
      <ResizablePanelGroup
        direction="horizontal"
        className="h-screen w-full items-stretch"
      >
        <ResizablePanel defaultSize={25} minSize={20} maxSize={30} className="min-w-[280px]">
          <Sidebar />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          {selectedChat ? (
            <ChatView />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted/40">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-foreground">Welcome to Fluent</h2>
                <p className="text-muted-foreground">Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
      <Toaster richColors />
    </>
  );
}