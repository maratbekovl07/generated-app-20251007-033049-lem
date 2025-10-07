import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CirclePlus, LogOut, Search, User as UserIcon } from 'lucide-react';
import { ChatList } from './ChatList';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useChatStore } from '@/stores/use-chat-store';
import { useNavigate } from 'react-router-dom';
import { UserProfileModal } from './UserProfileModal';
import { NewChatModal } from './NewChatModal';
export function Sidebar() {
  const [isProfileModalOpen, setProfileModalOpen] = React.useState(false);
  const [isNewChatModalOpen, setNewChatModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const loggedInUser = useChatStore(state => state.loggedInUser);
  const logout = useChatStore(state => state.logout);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  if (!loggedInUser) {
    return null; // or a loading state
  }
  return (
    <>
      <div className="flex h-full flex-col bg-muted/20 dark:bg-background">
        <header className="flex flex-shrink-0 items-center justify-between border-b p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={loggedInUser.avatar} alt={loggedInUser.name} />
                  <AvatarFallback>{loggedInUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h1 className="text-xl font-bold">{loggedInUser.name}</h1>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setProfileModalOpen(true)}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setNewChatModalOpen(true)}>
                    <CirclePlus className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>New Chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <ThemeToggle className="relative top-0 right-0" />
          </div>
        </header>
        <div className="flex-shrink-0 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <ChatList searchQuery={searchQuery} />
        </ScrollArea>
      </div>
      <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setProfileModalOpen(false)} />
      <NewChatModal isOpen={isNewChatModalOpen} onClose={() => setNewChatModalOpen(false)} />
    </>
  );
}