import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StudentPulseFeed } from "@/components/feed/StudentPulseFeed";
import { UpcomingEvents } from "@/components/events/UpcomingEvents";
import { CommunitiesSidebar } from "@/components/communities/CommunitiesSidebar";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <StudentPulseFeed />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <UpcomingEvents />
            <CommunitiesSidebar />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
