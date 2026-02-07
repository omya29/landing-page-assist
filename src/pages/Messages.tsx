import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    role: string;
  };
  lastMessage: {
    content: string;
    created_at: string;
    is_read: boolean;
    sender_id: string;
  } | null;
}

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    // Get user's conversations
    const { data: participantData } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (!participantData || participantData.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const conversationIds = participantData.map((p) => p.conversation_id);

    // Get other participants
    const { data: allParticipants } = await supabase
      .from("conversation_participants")
      .select("conversation_id, user_id")
      .in("conversation_id", conversationIds)
      .neq("user_id", user.id);

    if (!allParticipants) {
      setConversations([]);
      setLoading(false);
      return;
    }

    // Get profiles of other participants
    const otherUserIds = [...new Set(allParticipants.map((p) => p.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role")
      .in("id", otherUserIds);

    const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    // Get last messages for each conversation
    const conversationsWithDetails: Conversation[] = [];

    for (const convId of conversationIds) {
      const otherParticipant = allParticipants.find(
        (p) => p.conversation_id === convId
      );

      if (!otherParticipant) continue;

      const otherUserProfile = profilesMap.get(otherParticipant.user_id);
      if (!otherUserProfile) continue;

      const { data: lastMessage } = await supabase
        .from("messages")
        .select("content, created_at, is_read, sender_id")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      conversationsWithDetails.push({
        id: convId,
        otherUser: otherUserProfile,
        lastMessage,
      });
    }

    // Sort by last message time
    conversationsWithDetails.sort((a, b) => {
      const aTime = a.lastMessage?.created_at || "";
      const bTime = b.lastMessage?.created_at || "";
      return bTime.localeCompare(aTime);
    });

    setConversations(conversationsWithDetails);
    setLoading(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No messages yet</h3>
              <p className="text-muted-foreground">
                Start a conversation by visiting someone's profile
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Link key={conv.id} to={`/messages/${conv.id}`}>
                <Card className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conv.otherUser.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(conv.otherUser.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {conv.otherUser.full_name}
                          </span>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {conv.otherUser.role}
                          </Badge>
                        </div>
                        {conv.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conv.lastMessage.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p
                          className={`text-sm truncate ${
                            !conv.lastMessage.is_read &&
                            conv.lastMessage.sender_id !== user?.id
                              ? "font-medium text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {conv.lastMessage.sender_id === user?.id && "You: "}
                          {conv.lastMessage.content}
                        </p>
                      )}
                    </div>
                    {conv.lastMessage &&
                      !conv.lastMessage.is_read &&
                      conv.lastMessage.sender_id !== user?.id && (
                        <div className="w-3 h-3 rounded-full bg-primary shrink-0" />
                      )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
