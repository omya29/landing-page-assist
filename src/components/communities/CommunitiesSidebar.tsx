import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Building2, Code, Trophy, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type Community = Tables<"communities">;

const communityIcons: Record<string, typeof Building2> = {
  civil: Building2,
  tech: Code,
  sports: Trophy,
  cultural: Palette,
};

export function CommunitiesSidebar() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .order("member_count", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching communities:", error);
    } else {
      setCommunities(data || []);
    }
    setLoading(false);
  };

  const getIcon = (iconName: string | null) => {
    if (!iconName) return Building2;
    return communityIcons[iconName] || Building2;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Communities</CardTitle>
            <p className="text-sm text-muted-foreground">Join official groups</p>
          </div>
          <Link
            to="/communities"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : communities.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No communities yet
          </div>
        ) : (
          communities.map((community) => {
            const Icon = getIcon(community.icon);
            return (
              <Link
                key={community.id}
                to={`/communities/${community.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                    {community.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {community.member_count} Samarthians
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            );
          })
        )}

        {/* Promo Card */}
        <div className="mt-4 p-4 bg-sidebar rounded-xl">
          <h4 className="font-semibold text-sidebar-foreground">Grow Together</h4>
          <p className="text-sm text-sidebar-foreground/80 mt-1">
            Create a study group or plan a campus event with ease.
          </p>
          <Button className="w-full mt-3" variant="secondary">
            Start Something New
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
