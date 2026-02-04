import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StudentPulseFeed } from "@/components/feed/StudentPulseFeed";

export default function Feed() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <StudentPulseFeed />
      </div>
    </DashboardLayout>
  );
}
