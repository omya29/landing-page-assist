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
import { Building2, Code, Trophy, Palette, Users, Loader2, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Community = Tables<"communities">;
type Profile = Tables<"profiles">;

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
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [joiningLoading, setJoiningLoading] = useState(false);

  useEffect(() => {
    if (communityId) {
      fetchCommunity();
      fetchMembers();
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-secondary flex items-center justify-center flex-shrink-0">
                <Icon className="h-10 w-10 md:h-12 md:w-12 text-primary" />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">{community.name}</h1>
                {community.description && (
                  <p className="text-muted-foreground mt-2">{community.description}</p>
                )}
                <div className="flex items-center justify-center md:justify-start gap-2 mt-4">
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" />
                    {community.member_count} members
                  </Badge>
                </div>

                <div className="mt-4">
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
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Members ({members.length})</h2>
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
        </div>
      </div>
    </DashboardLayout>
  );
}
