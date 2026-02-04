import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { PostCard } from "./PostCard";
import { Loader2 } from "lucide-react";

type Profile = Tables<"profiles">;
type PostRow = Tables<"posts">;

interface Post extends PostRow {
  profiles: Profile | null;
}

export function StudentPulseFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"latest" | "trending">("latest");

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    setLoading(true);
    
    // Fetch posts
    const { data: postsData, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .order(filter === "latest" ? "created_at" : "likes_count", { ascending: false })
      .limit(20);

    if (postsError) {
      console.error("Error fetching posts:", postsError);
      setLoading(false);
      return;
    }

    // Fetch profiles for each post
    const userIds = [...new Set(postsData.map(p => p.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
    
    const postsWithProfiles: Post[] = postsData.map(post => ({
      ...post,
      profiles: profilesMap.get(post.user_id) || null
    }));

    setPosts(postsWithProfiles);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Student Pulse</h2>
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          <Button
            variant={filter === "latest" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("latest")}
          >
            Latest
          </Button>
          <Button
            variant={filter === "trending" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("trending")}
          >
            Trending
          </Button>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border">
          <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
          ))}
        </div>
      )}
    </div>
  );
}
