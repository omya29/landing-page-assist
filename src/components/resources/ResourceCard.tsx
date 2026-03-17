import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Download, Trash2, FileText, FileImage, FileSpreadsheet, Presentation } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface Resource {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  department: string | null;
  subject: string | null;
  year: string | null;
  file_url: string;
  file_type: string;
  file_size: number;
  download_count: number;
  created_at: string;
  profiles: Profile | null;
}

interface ResourceCardProps {
  resource: Resource;
  onUpdate: () => void;
}

const fileTypeIcons: Record<string, React.ElementType> = {
  pdf: FileText,
  doc: FileText,
  ppt: Presentation,
  image: FileImage,
  xls: FileSpreadsheet,
  other: FileText,
};

const fileTypeColors: Record<string, string> = {
  pdf: "bg-destructive/10 text-destructive",
  doc: "bg-primary/10 text-primary",
  ppt: "bg-orange-500/10 text-orange-600",
  image: "bg-green-500/10 text-green-600",
  xls: "bg-emerald-500/10 text-emerald-600",
  other: "bg-muted text-muted-foreground",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function ResourceCard({ resource, onUpdate }: ResourceCardProps) {
  const { user, isAdmin } = useAuth();
  const Icon = fileTypeIcons[resource.file_type] || FileText;
  const colorClass = fileTypeColors[resource.file_type] || fileTypeColors.other;

  const handleDownload = async () => {
    window.open(resource.file_url, "_blank");
    // Increment download count
    await supabase
      .from("resources" as any)
      .update({ download_count: resource.download_count + 1 } as any)
      .eq("id", resource.id);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    const { error } = await supabase.from("resources" as any).delete().eq("id", resource.id);
    if (error) {
      toast.error("Failed to delete resource");
    } else {
      toast.success("Resource deleted");
      onUpdate();
    }
  };

  const canDelete = user?.id === resource.user_id || isAdmin;

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Card className="card-shadow card-hover">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{resource.title}</h3>
            {resource.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {resource.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {resource.department && (
                <Badge variant="secondary" className="text-[10px]">
                  {resource.department.toUpperCase()}
                </Badge>
              )}
              {resource.subject && (
                <Badge variant="outline" className="text-[10px]">
                  {resource.subject}
                </Badge>
              )}
              {resource.year && (
                <Badge variant="outline" className="text-[10px]">
                  {resource.year}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatFileSize(resource.file_size)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={resource.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                    {resource.profiles?.full_name ? getInitials(resource.profiles.full_name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {resource.profiles?.full_name || "Anonymous"} •{" "}
                  {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground mr-1">
                  {resource.download_count} downloads
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
