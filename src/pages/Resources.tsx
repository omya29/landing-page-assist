import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ResourceFilters } from "@/components/resources/ResourceFilters";
import { ResourceUploadDialog } from "@/components/resources/ResourceUploadDialog";
import { BookOpen, Loader2 } from "lucide-react";

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

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [year, setYear] = useState("all");
  const [fileType, setFileType] = useState("all");

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("resources" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching resources:", error);
      setLoading(false);
      return;
    }

    const items = data as any[];
    const userIds = [...new Set(items.map((r: any) => r.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    const profilesMap = new Map(profilesData?.map((p) => [p.id, p]) || []);

    const resourcesWithProfiles: Resource[] = items.map((r: any) => ({
      ...r,
      profiles: profilesMap.get(r.user_id) || null,
    }));

    setResources(resourcesWithProfiles);
    setLoading(false);
  };

  const filtered = resources.filter((r) => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) &&
        !r.description?.toLowerCase().includes(search.toLowerCase()) &&
        !r.subject?.toLowerCase().includes(search.toLowerCase())) return false;
    if (department !== "all" && r.department !== department) return false;
    if (year !== "all" && r.year !== year) return false;
    if (fileType !== "all" && r.file_type !== fileType) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Resources</h1>
              <p className="text-muted-foreground">Share notes, PDFs & past papers</p>
            </div>
          </div>
          <ResourceUploadDialog onUploaded={fetchResources} />
        </div>

        <ResourceFilters
          search={search}
          onSearchChange={setSearch}
          department={department}
          onDepartmentChange={setDepartment}
          year={year}
          onYearChange={setYear}
          fileType={fileType}
          onFileTypeChange={setFileType}
        />

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">No resources found</h3>
            <p className="text-muted-foreground">Be the first to upload a resource!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} onUpdate={fetchResources} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
