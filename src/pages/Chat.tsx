import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, ChatRoom, Message } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Plus, Send, MessageSquare, Hash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const Chat = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      loadChatRooms();
    }
  }, [isAuthenticated]);

  const loadChatRooms = async () => {
    try {
      const rooms = await api.getChatRooms();
      setChatRooms(rooms);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chat rooms",
        variant: "destructive",
      });
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    setIsCreatingRoom(true);
    try {
      const newRoom = await api.createChatRoom(newRoomName);
      setChatRooms([...chatRooms, newRoom]);
      setNewRoomName('');
      toast({
        title: "Room created",
        description: `${newRoom.name} has been created successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create chat room",
        variant: "destructive",
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedRoom || !user) return;

    setIsSendingMessage(true);
    try {
      const newMessage = await api.sendMessage({
        sender: user.user_id,
        receiver: [user.user_id], // Adjust as needed for your use case
        content: messageInput,
        chat_room: selectedRoom.id,
      });
      setMessages([...messages, newMessage]);
      setMessageInput('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Error handled in auth context
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-sidebar-background border-r border-sidebar-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-lg">ChatSpace</h2>
                <p className="text-xs text-sidebar-foreground/60">{user?.username}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hover:bg-sidebar-accent"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full gradient-primary shadow-glow hover:scale-[1.02] transition-smooth">
                <Plus className="w-4 h-4 mr-2" />
                New Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Room</DialogTitle>
                <DialogDescription>
                  Enter a name for your new chat room
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roomName">Room Name</Label>
                  <Input
                    id="roomName"
                    placeholder="e.g., General, Random"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-primary"
                  disabled={isCreatingRoom}
                >
                  {isCreatingRoom ? 'Creating...' : 'Create Room'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Rooms List */}
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {chatRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-smooth ${
                  selectedRoom?.id === room.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                }`}
              >
                <Hash className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium truncate">{room.name}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-border px-6 flex items-center bg-card">
              <Hash className="w-5 h-5 mr-2 text-muted-foreground" />
              <h2 className="text-lg font-semibold">{selectedRoom.name}</h2>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === user?.user_id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-md px-4 py-3 rounded-2xl ${
                          message.sender === user?.user_id
                            ? 'bg-[hsl(var(--chat-bubble-sent))] text-[hsl(var(--chat-bubble-sent-foreground))] shadow-glow'
                            : 'bg-[hsl(var(--chat-bubble-received))] text-[hsl(var(--chat-bubble-received-foreground))]'
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-border p-4 bg-card">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-2">
                <Input
                  placeholder={`Message #${selectedRoom.name}`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 transition-smooth focus:shadow-glow"
                />
                <Button
                  type="submit"
                  disabled={isSendingMessage || !messageInput.trim()}
                  className="gradient-primary shadow-glow hover:scale-[1.02] transition-smooth"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Welcome to ChatSpace</h3>
              <p className="text-muted-foreground">
                Select a chat room from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
