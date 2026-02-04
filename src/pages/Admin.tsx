import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminEvents } from "@/components/admin/AdminEvents";
import { AdminCommunities } from "@/components/admin/AdminCommunities";
import { AdminPosts } from "@/components/admin/AdminPosts";
import { Shield, Calendar, Users, Newspaper } from "lucide-react";

export default function Admin() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage events, communities, and moderate content
            </p>
          </div>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="communities" className="gap-2">
              <Users className="h-4 w-4" />
              Communities
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-2">
              <Newspaper className="h-4 w-4" />
              Posts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <AdminEvents />
          </TabsContent>

          <TabsContent value="communities">
            <AdminCommunities />
          </TabsContent>

          <TabsContent value="posts">
            <AdminPosts />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
