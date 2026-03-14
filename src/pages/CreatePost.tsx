import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Send, ArrowLeft, ImagePlus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useImageUpload } from "@/hooks/use-image-upload";

export default function CreatePost() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { preview, handleFileSelect, upload, clear, uploading } = useImageUpload({
    bucket: "post-images",
    maxSizeMB: 5,
  });

  const extractHashtags = (text: string): string[] => {
    const matches = text.match(/#(\w+)/g);
    return matches ? matches.map((tag) => tag.slice(1)) : [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setLoading(true);
    const hashtags = extractHashtags(content);

    let imageUrl: string | null = null;
    if (preview) {
      imageUrl = await upload(user.id);
      if (!imageUrl && preview) {
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      content: content.trim(),
      hashtags: hashtags.length > 0 ? hashtags : null,
      image_url: imageUrl,
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

              {/* Image preview */}
              {preview && (
                <div className="relative inline-block">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-64 rounded-lg object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={clear}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                    <ImagePlus className="h-5 w-5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {content.length}/1000 characters
                  </span>
                </div>
                <Button type="submit" disabled={loading || uploading || !content.trim()}>
                  {loading || uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploading ? "Uploading..." : "Publishing..."}
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
