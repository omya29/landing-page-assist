import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2, Code, Trophy, Palette, Users, Search, Loader2, Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type Community = Tables<"communities">;

const communityIcons: Record<string, typeof Building2> = {
  civil: Building2,
  tech: Code,
  sports: Trophy,
  cultural: Palette,
};

export default function Communities() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [memberships, setMemberships] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCommunities();
    if (user) {
      fetchMemberships();
    }
  }, [user]);

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

  const fetchMemberships = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("community_members")
      .select("community_id")
      .eq("user_id", user.id);

    if (data) {
      setMemberships(new Set(data.map((m) => m.community_id)));
    }
  };

  const handleJoin = async (e: React.MouseEvent, communityId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    setJoiningId(communityId);

    const { error } = await supabase.from("community_members").insert({
      community_id: communityId,
      user_id: user.id,
    });

    if (error) {
      toast.error("Failed to join community");
    } else {
      setMemberships((prev) => new Set([...prev, communityId]));
      toast.success("Joined community!");
      fetchCommunities();
    }
    setJoiningId(null);
  };

  const handleLeave = async (e: React.MouseEvent, communityId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    setJoiningId(communityId);

    const { error } = await supabase
      .from("community_members")
      .delete()
      .eq("community_id", communityId)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to leave community");
    } else {
      setMemberships((prev) => {
        const next = new Set(prev);
        next.delete(communityId);
        return next;
      });
      toast.success("Left community");
      fetchCommunities();
    }
    setJoiningId(null);
  };

  const getIcon = (iconName: string | null) => {
    if (!iconName) return Building2;
    return communityIcons[iconName] || Building2;
  };

  const filteredCommunities = communities.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Communities</h1>
          <p className="text-muted-foreground">
            Join communities to connect with fellow Samarthians
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredCommunities.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No communities found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCommunities.map((community) => {
              const Icon = getIcon(community.icon);
              const isMember = memberships.has(community.id);
              const isLoading = joiningId === community.id;

              return (
                <Link key={community.id} to={`/communities/${community.id}`}>
                  <Card className="card-hover h-full group cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                          <Icon className="h-7 w-7 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {community.name}
                            </h3>
                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {community.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {community.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="secondary" className="gap-1">
                              <Users className="h-3 w-3" />
                              {community.member_count} members
                            </Badge>
                            {isMember && (
                              <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                                <Check className="h-3 w-3" />
                                Joined
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        {isMember ? (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={(e) => handleLeave(e, community.id)}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Leave Community"
                            )}
                          </Button>
                        ) : (
                          <Button
                            className="w-full"
                            onClick={(e) => handleJoin(e, community.id)}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Join Community"
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
