import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Mic, Smile, SendHorizonal, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import { useChatStore } from '@/stores/use-chat-store';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/components/ui/sonner';
import { EmojiPicker } from './EmojiPicker';
export function MessageInput() {
  const [text, setText] = React.useState('');
  const selectedChat = useChatStore(state => state.selectedChat);
  const sendMessage = useChatStore(state => state.sendMessage);
  const handleSend = () => {
    if (text.trim() && selectedChat) {
      sendMessage(selectedChat.id, { type: 'text', text: text.trim() });
      setText('');
    }
  };
  const handleSendImage = () => {
    if (!selectedChat) return;
    const url = prompt("Enter image URL:");
    if (url) {
      sendMessage(selectedChat.id, { type: 'image', url });
    }
  };
  const handleSendFile = () => {
    if (!selectedChat) return;
    const url = prompt("Enter file URL:");
    const fileName = prompt("Enter file name:", "document.pdf");
    if (url && fileName) {
      sendMessage(selectedChat.id, { type: 'file', url, fileName, fileSize: 0 }); // fileSize is mock
      toast.info("File sending is a mock. Only the link is sent.");
    }
  };
  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };
  const handleEmojiSelect = (emoji: string) => {
    setText(prevText => prevText + emoji);
  };
  return (
    <div className="flex-shrink-0 border-t bg-background p-4">
      <div className="relative">
        <Textarea
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          className="min-h-[48px] resize-none rounded-2xl pr-32"
          disabled={!selectedChat}
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!selectedChat}>
                <Paperclip className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2">
              <Button variant="ghost" className="w-full justify-start" onClick={handleSendImage} disabled>
                <ImageIcon className="mr-2 h-4 w-4" /> Image
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={handleSendFile} disabled>
                <FileIcon className="mr-2 h-4 w-4" /> File
              </Button>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!selectedChat}>
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </PopoverContent>
          </Popover>
          {text.trim() ? (
            <Button size="icon" className="h-8 w-8 rounded-full" onClick={handleSend} disabled={!selectedChat}>
              <SendHorizonal className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="icon" className="h-8 w-8 rounded-full" disabled={!selectedChat}>
              <Mic className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}