import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send } from "lucide-react";
import type { Message, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

export default function MessagesPage() {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  // Get all users to show in the sidebar
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Get messages for the selected conversation
  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return [];
      const res = await fetch(`/api/messages/${selectedUserId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!selectedUserId,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedUserId) return;
      const res = await apiRequest("POST", "/api/messages", {
        receiverId: selectedUserId,
        content,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUserId] });
      setMessage("");
    },
  });

  const otherUsers = users?.filter((u) => u.id !== user?.id) || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-[300px_1fr] gap-6 h-[calc(100vh-12rem)]">
          {/* Users list */}
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-4">Conversations</h2>
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-2">
                  {otherUsers.map((otherUser) => (
                    <Button
                      key={otherUser.id}
                      variant={selectedUserId === otherUser.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedUserId(otherUser.id)}
                    >
                      {otherUser.fullName}
                      <span className="text-xs ml-2 text-muted-foreground">
                        ({otherUser.role})
                      </span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat window */}
          <Card>
            <CardContent className="p-4">
              {selectedUserId ? (
                <>
                  <ScrollArea className="h-[calc(100vh-20rem)] mb-4">
                    {isLoadingMessages ? (
                      <div className="flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages?.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.senderId === user?.id
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`rounded-lg px-4 py-2 max-w-[70%] ${
                                message.senderId === user?.id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p>{message.content}</p>
                              <span className="text-xs opacity-70">
                                {new Date(message.createdAt || "").toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (message.trim()) {
                        sendMessage.mutate(message);
                      }
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                    />
                    <Button
                      type="submit"
                      disabled={sendMessage.isPending || !message.trim()}
                    >
                      {sendMessage.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Select a conversation to start messaging
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}