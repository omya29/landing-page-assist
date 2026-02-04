import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

type Event = Tables<"events">;

const eventTypeColors: Record<string, string> = {
  official: "bg-event-official",
  sports: "bg-event-sports",
  academic: "bg-event-academic",
  cultural: "bg-event-cultural",
  other: "bg-muted-foreground",
};

export function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(5);

    if (error) {
      console.error("Error fetching events:", error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "TODAY";
    if (isTomorrow(date)) return "TOMORROW";
    return format(date, "EEE").toUpperCase();
  };

  const getDateNumber = (dateStr: string) => {
    return format(parseISO(dateStr), "d");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Upcoming</CardTitle>
            <p className="text-sm text-muted-foreground">Events at Samarth</p>
          </div>
          <Link
            to="/events"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No upcoming events
          </div>
        ) : (
          events.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary transition-colors group"
            >
              <div className="flex-shrink-0 w-12 text-center">
                <p className="text-[10px] font-semibold text-primary">
                  {getDateLabel(event.event_date)}
                </p>
                <p className="text-xl font-bold">{getDateNumber(event.event_date)}</p>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                  {event.title}
                </h4>
                {event.location && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </p>
                )}
                <Badge
                  variant="secondary"
                  className={cn(
                    "mt-1.5 text-[10px] px-2 py-0 text-white",
                    eventTypeColors[event.event_type]
                  )}
                >
                  {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                </Badge>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
