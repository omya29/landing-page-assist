import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

type Community = Tables<"communities">;

export function AdminCommunities() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .order("member_count", { ascending: false });

    if (error) {
      console.error("Error fetching communities:", error);
    } else {
      setCommunities(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setIcon("");
    setEditingCommunity(null);
  };

  const openEditDialog = (community: Community) => {
    setEditingCommunity(community);
    setName(community.name);
    setDescription(community.description || "");
    setIcon(community.icon || "");
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormLoading(true);

    const communityData = {
      name,
      description: description || null,
      icon: icon || null,
      created_by: user.id,
    };

    if (editingCommunity) {
      const { error } = await supabase
        .from("communities")
        .update(communityData)
        .eq("id", editingCommunity.id);

      if (error) {
        toast.error("Failed to update community");
      } else {
        toast.success("Community updated!");
        setDialogOpen(false);
        resetForm();
        fetchCommunities();
      }
    } else {
      const { error } = await supabase.from("communities").insert(communityData);

      if (error) {
        toast.error("Failed to create community");
      } else {
        toast.success("Community created!");
        setDialogOpen(false);
        resetForm();
        fetchCommunities();
      }
    }
    setFormLoading(false);
  };

  const handleDelete = async (communityId: string) => {
    if (!confirm("Are you sure you want to delete this community? All members will be removed.")) return;

    const { error } = await supabase.from("communities").delete().eq("id", communityId);

    if (error) {
      toast.error("Failed to delete community");
    } else {
      toast.success("Community deleted");
      fetchCommunities();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Manage Communities</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Community
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCommunity ? "Edit Community" : "Create New Community"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Community Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter community name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Community description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (optional)</Label>
                <Input
                  id="icon"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="civil, tech, sports, cultural"
                />
                <p className="text-xs text-muted-foreground">
                  Enter: civil, tech, sports, or cultural
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingCommunity ? (
                    "Update Community"
                  ) : (
                    "Create Community"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : communities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No communities yet. Create your first community!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {communities.map((community) => (
            <Card key={community.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{community.name}</h3>
                    {community.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {community.description}
                      </p>
                    )}
                    <Badge variant="secondary" className="mt-2 gap-1">
                      <Users className="h-3 w-3" />
                      {community.member_count} members
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(community)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(community.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
