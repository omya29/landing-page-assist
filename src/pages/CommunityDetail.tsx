import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PostCard } from "@/components/feed/PostCard";
import { Building2, Code, Trophy, Palette, Users, Loader2, Check, ArrowLeft, PenSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Community = Tables<"communities">;
type Profile = Tables<"profiles">;
type PostRow = Tables<"posts">;

interface Post extends PostRow {
  profiles: Profile | null;
}

const communityIcons: Record<string, typeof Building2> = {
  civil: Building2,
  tech: Code,
  sports: Trophy,
  cultural: Palette,
};

const departmentColors: Record<string, string> = {
  civil: "bg-badge-civil text-white",
  comp: "bg-badge-comp text-white",
  mba: "bg-badge-mba text-white",
  mech: "bg-badge-mech text-white",
  entc: "bg-primary text-primary-foreground",
};

export default function CommunityDetail() {
  const { communityId } = useParams<{ communityId: string }>();
  const { user } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [joiningLoading, setJoiningLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [newPostContent, setNewPostContent] = useState("");
  const [postingLoading, setPostingLoading] = useState(false);

  useEffect(() => {
    if (communityId) {
      fetchCommunity();
      fetchMembers();
      fetchPosts();
      if (user) {
        checkMembership();
      }
    }
  }, [communityId, user]);

  const fetchCommunity = async () => {
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .eq("id", communityId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching community:", error);
    }
    setCommunity(data);
    setLoading(false);
  };

  const fetchMembers = async () => {
    const { data: memberData } = await supabase
      .from("community_members")
      .select("user_id")
      .eq("community_id", communityId);

    if (memberData && memberData.length > 0) {
      const userIds = memberData.map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      setMembers(profiles || []);
    }
  };

  const fetchPosts = async () => {
    const { data: postsData } = await supabase
      .from("posts")
      .select("*")
      .eq("community_id", communityId)
      .order("created_at", { ascending: false });

    if (postsData && postsData.length > 0) {
      const userIds = [...new Set(postsData.map((p) => p.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      const profilesMap = new Map(profilesData?.map((p) => [p.id, p]) || []);

      const postsWithProfiles: Post[] = postsData.map((post) => ({
        ...post,
        profiles: profilesMap.get(post.user_id) || null,
      }));

      setPosts(postsWithProfiles);
    } else {
      setPosts([]);
    }
  };

  const checkMembership = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("community_members")
      .select("id")
      .eq("community_id", communityId)
      .eq("user_id", user.id)
      .maybeSingle();

    setIsMember(!!data);
  };

  const handleJoin = async () => {
    if (!user) return;
    setJoiningLoading(true);

    const { error } = await supabase.from("community_members").insert({
      community_id: communityId,
      user_id: user.id,
    });

    if (error) {
      toast.error("Failed to join community");
    } else {
      setIsMember(true);
      toast.success("Joined community!");
      fetchCommunity();
      fetchMembers();
    }
    setJoiningLoading(false);
  };

  const handleLeave = async () => {
    if (!user) return;
    setJoiningLoading(true);

    const { error } = await supabase
      .from("community_members")
      .delete()
      .eq("community_id", communityId)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to leave community");
    } else {
      setIsMember(false);
      toast.success("Left community");
      fetchCommunity();
      fetchMembers();
    }
    setJoiningLoading(false);
  };

  const handleCreatePost = async () => {
    if (!user || !newPostContent.trim()) return;
    setPostingLoading(true);

    const { error } = await supabase.from("posts").insert({
      content: newPostContent.trim(),
      user_id: user.id,
      community_id: communityId,
    });

    if (error) {
      toast.error("Failed to create post");
    } else {
      toast.success("Post created!");
      setNewPostContent("");
      fetchPosts();
    }
    setPostingLoading(false);
  };

  const getIcon = (iconName: string | null) => {
    if (!iconName) return Building2;
    return communityIcons[iconName] || Building2;
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

  if (!community) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold">Community not found</h2>
          <Link to="/communities">
            <Button variant="link" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Communities
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const Icon = getIcon(community.icon);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Button */}
        <Link to="/communities">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            All Communities
          </Button>
        </Link>

        {/* Community Header */}
        <Card className="overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5" />
          <CardContent className="pt-0 -mt-12">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-card border-4 border-background flex items-center justify-center flex-shrink-0 shadow-lg">
                <Icon className="h-10 w-10 text-primary" />
              </div>

              <div className="flex-1 text-center md:text-left pb-2">
                <h1 className="text-2xl font-bold">{community.name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" />
                    {community.member_count} members
                  </Badge>
                  <Badge variant="outline">{posts.length} posts</Badge>
                </div>
              </div>

              <div className="pb-2">
                {isMember ? (
                  <Button
                    variant="outline"
                    onClick={handleLeave}
                    disabled={joiningLoading}
                  >
                    {joiningLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Joined
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={handleJoin} disabled={joiningLoading}>
                    {joiningLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Join Community"
                    )}
                  </Button>
                )}
              </div>
            </div>
            {community.description && (
              <p className="text-muted-foreground mt-4 text-center md:text-left">
                {community.description}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Create Post (for members) */}
        {isMember && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder={`Share something with ${community.name}...`}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleCreatePost}
                      disabled={postingLoading || !newPostContent.trim()}
                    >
                      {postingLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="flex-1 gap-2">
              <PenSquare className="h-4 w-4" />
              Posts ({posts.length})
            </TabsTrigger>
            <TabsTrigger value="members" className="flex-1 gap-2">
              <Users className="h-4 w-4" />
              Members ({members.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-4 space-y-4">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <PenSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No posts yet in this community.</p>
                  {isMember && (
                    <p className="text-sm mt-2">Be the first to share something!</p>
                  )}
                  {!isMember && (
                    <p className="text-sm mt-2">Join to start posting!</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
              ))
            )}
          </TabsContent>

          <TabsContent value="members" className="mt-4">
            {members.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No members yet. Be the first to join!
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <Link key={member.id} to={`/profile/${member.id}`}>
                    <Card className="hover:bg-accent/50 transition-colors">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(member.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{member.full_name}</span>
                            {member.department && (
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs",
                                  departmentColors[member.department] || ""
                                )}
                              >
                                {member.department.toUpperCase()}
                                {member.year && ` • ${member.year}`}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">
                            {member.role}
                            {member.subject && ` • ${member.subject}`}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
