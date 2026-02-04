import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Send, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function CreatePost() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const extractHashtags = (text: string): string[] => {
    const matches = text.match(/#(\w+)/g);
    return matches ? matches.map((tag) => tag.slice(1)) : [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setLoading(true);
    const hashtags = extractHashtags(content);

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      content: content.trim(),
      hashtags: hashtags.length > 0 ? hashtags : null,
    });

    if (error) {
      toast.error("Failed to create post");
    } else {
      toast.success("Post published!");
      navigate("/feed");
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Link
          to="/feed"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Create a Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="What's happening on campus? Use #hashtags to categorize your post..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="resize-none"
                maxLength={1000}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {content.length}/1000 characters
                </span>
                <Button type="submit" disabled={loading || !content.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Publish Post
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
