import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  department: string | null;
  year: string | null;
  role: string;
}

interface FollowListProps {
  userId: string;
  type: "followers" | "following";
}

const departmentColors: Record<string, string> = {
  civil: "bg-badge-civil text-white",
  comp: "bg-badge-comp text-white",
  mba: "bg-badge-mba text-white",
  mech: "bg-badge-mech text-white",
  entc: "bg-primary text-primary-foreground",
};

export function FollowList({ userId, type }: FollowListProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowList();
  }, [userId, type]);

  const fetchFollowList = async () => {
    setLoading(true);

    const column = type === "followers" ? "follower_id" : "following_id";
    const targetColumn = type === "followers" ? "following_id" : "follower_id";

    const { data: follows } = await supabase
      .from("follows")
      .select(column)
      .eq(targetColumn, userId);

    if (!follows || follows.length === 0) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    const userIds = follows.map((f) => f[column as keyof typeof f] as string);

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, department, year, role")
      .in("id", userIds);

    setProfiles(profilesData || []);
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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No {type} yet
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {profiles.map((profile) => (
        <Link key={profile.id} to={`/profile/${profile.id}`}>
          <Card className="hover:bg-accent/50 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <Avatar>
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{profile.full_name}</span>
                  {profile.department && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        departmentColors[profile.department] || ""
                      )}
                    >
                      {profile.department.toUpperCase()}
                      {profile.year && ` • ${profile.year}`}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground capitalize">
                  {profile.role}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
