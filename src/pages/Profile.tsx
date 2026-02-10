import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/feed/PostCard";
import { FollowList } from "@/components/profile/FollowList";
import { Loader2, MessageCircle, UserPlus, UserMinus, GraduationCap, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const departmentColors: Record<string, string> = {
  civil: "bg-badge-civil text-white",
  comp: "bg-badge-comp text-white",
  mba: "bg-badge-mba text-white",
  mech: "bg-badge-mech text-white",
  entc: "bg-primary text-primary-foreground",
};

type Profile = Tables<"profiles">;
type PostRow = Tables<"posts">;

interface Post extends PostRow {
  profiles: Profile | null;
}

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchPosts();
      if (user) {
        checkFollowStatus();
      }
    }
  }, [userId, user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      toast.error("Profile not found");
      return;
    }

    setProfile(data);
    setLoading(false);
  };

  const fetchPosts = async () => {
    const { data: postsData } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (postsData) {
      const postsWithProfile = postsData.map((post) => ({
        ...post,
        profiles: profile,
      }));
      setPosts(postsWithProfile as Post[]);
    }
  };

  const checkFollowStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", userId)
      .maybeSingle();

    setIsFollowing(!!data);
  };

  const handleFollow = async () => {
    if (!user) {
      toast.error("Please sign in to follow users");
      return;
    }

    setFollowLoading(true);

    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", userId);

      setIsFollowing(false);
      setProfile((prev) =>
        prev ? { ...prev, followers_count: prev.followers_count - 1 } : null
      );
      toast.success("Unfollowed");
    } else {
      await supabase.from("follows").insert({
        follower_id: user.id,
        following_id: userId,
      });

      setIsFollowing(true);
      setProfile((prev) =>
        prev ? { ...prev, followers_count: prev.followers_count + 1 } : null
      );
      toast.success("Following");
    }

    setFollowLoading(false);
  };

  const handleStartChat = async () => {
    if (!user || !userId) return;

    // Check if conversation already exists
    const { data: existingConversations } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (existingConversations) {
      for (const conv of existingConversations) {
        const { data: otherParticipant } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", conv.conversation_id)
          .eq("user_id", userId)
          .maybeSingle();

        if (otherParticipant) {
          navigate(`/messages/${conv.conversation_id}`);
          return;
        }
      }
    }

    // Create new conversation
    const { data: newConversation, error } = await supabase
      .from("conversations")
      .insert({})
      .select()
      .single();

    if (error) {
      toast.error("Failed to start conversation");
      return;
    }

    // Add self first (satisfies RLS), then add the other user
    await supabase.from("conversation_participants").insert({
      conversation_id: newConversation.id,
      user_id: user.id,
    });
    await supabase.from("conversation_participants").insert({
      conversation_id: newConversation.id,
      user_id: userId!,
    });

    navigate(`/messages/${newConversation.id}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold">Profile not found</h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    {profile.role === "professor" ? (
                      <Badge variant="secondary" className="gap-1">
                        <BookOpen className="h-3 w-3" />
                        Professor
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <GraduationCap className="h-3 w-3" />
                        Student
                      </Badge>
                    )}
                    {profile.department && (
                      <Badge
                        className={cn(
                          departmentColors[profile.department] || "bg-secondary"
                        )}
                      >
                        {profile.department.toUpperCase()}
                        {profile.year && ` • ${profile.year}`}
                      </Badge>
                    )}
                  </div>
                </div>

                {profile.subject && (
                  <p className="text-muted-foreground mb-2">
                    Specialization: {profile.subject}
                  </p>
                )}

                {profile.bio && (
                  <p className="text-muted-foreground mb-4">{profile.bio}</p>
                )}

                {/* Stats */}
                <div className="flex justify-center md:justify-start gap-6 mb-4">
                  <button
                    onClick={() => setActiveTab("followers")}
                    className="text-center hover:text-primary transition-colors"
                  >
                    <span className="font-bold text-lg">{profile.followers_count}</span>
                    <span className="text-muted-foreground ml-1">Followers</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("following")}
                    className="text-center hover:text-primary transition-colors"
                  >
                    <span className="font-bold text-lg">{profile.following_count}</span>
                    <span className="text-muted-foreground ml-1">Following</span>
                  </button>
                  <div className="text-center">
                    <span className="font-bold text-lg">{posts.length}</span>
                    <span className="text-muted-foreground ml-1">Posts</span>
                  </div>
                </div>

                {/* Actions */}
                {!isOwnProfile && (
                  <div className="flex gap-3 justify-center md:justify-start">
                    <Button
                      variant={isFollowing ? "outline" : "default"}
                      onClick={handleFollow}
                      disabled={followLoading}
                    >
                      {followLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleStartChat}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
            <TabsTrigger value="followers" className="flex-1">Followers</TabsTrigger>
            <TabsTrigger value="following" className="flex-1">Following</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-4 space-y-4">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No posts yet
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{ ...post, profiles: profile }}
                  onUpdate={fetchPosts}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="followers" className="mt-4">
            <FollowList userId={userId!} type="followers" />
          </TabsContent>

          <TabsContent value="following" className="mt-4">
            <FollowList userId={userId!} type="following" />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
