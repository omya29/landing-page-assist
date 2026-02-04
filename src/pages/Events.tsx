import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, Loader2, CalendarDays, List } from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

type Event = Tables<"events">;

const eventTypeColors: Record<string, string> = {
  official: "bg-event-official",
  sports: "bg-event-sports",
  academic: "bg-event-academic",
  cultural: "bg-event-cultural",
  other: "bg-muted-foreground",
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"calendar" | "list">("calendar");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    if (error) {
      console.error("Error fetching events:", error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const eventsOnDate = (date: Date) => {
    return events.filter((event) =>
      isSameDay(parseISO(event.event_date), date)
    );
  };

  const hasEvents = (date: Date) => {
    return events.some((event) =>
      isSameDay(parseISO(event.event_date), date)
    );
  };

  const selectedEvents = selectedDate ? eventsOnDate(selectedDate) : [];
  const upcomingEvents = events.filter(
    (event) => parseISO(event.event_date) >= new Date()
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Campus Events</h1>
            <p className="text-muted-foreground">
              Discover and join events happening at Samarth
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={view === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("calendar")}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Calendar
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : view === "calendar" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-2">
              <CardContent className="p-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md"
                  modifiers={{
                    hasEvent: (date) => hasEvents(date),
                  }}
                  modifiersStyles={{
                    hasEvent: {
                      backgroundColor: "hsl(var(--primary) / 0.1)",
                      fontWeight: "bold",
                    },
                  }}
                />
              </CardContent>
            </Card>

            {/* Selected Date Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedDate
                    ? format(selectedDate, "EEEE, MMMM d")
                    : "Select a date"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedEvents.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No events on this date
                  </p>
                ) : (
                  selectedEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No upcoming events</p>
                </CardContent>
              </Card>
            ) : (
              upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} expanded />
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

interface EventCardProps {
  event: Event;
  expanded?: boolean;
}

function EventCard({ event, expanded = false }: EventCardProps) {
  return (
    <Card className={cn("card-hover", expanded && "")}>
      <CardContent className={cn("p-4", expanded && "p-6")}>
        <div className="flex items-start gap-4">
          {expanded && (
            <div className="flex-shrink-0 w-16 text-center bg-secondary rounded-lg p-2">
              <p className="text-xs font-semibold text-primary">
                {format(parseISO(event.event_date), "MMM").toUpperCase()}
              </p>
              <p className="text-2xl font-bold">
                {format(parseISO(event.event_date), "d")}
              </p>
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className={cn("font-semibold", expanded ? "text-lg" : "text-sm")}>
                {event.title}
              </h3>
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] px-2 text-white flex-shrink-0",
                  eventTypeColors[event.event_type]
                )}
              >
                {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
              </Badge>
            </div>
            {event.description && expanded && (
              <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                {event.description}
              </p>
            )}
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.location}
                </span>
              )}
              {event.start_time && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {event.start_time.slice(0, 5)}
                  {event.end_time && ` - ${event.end_time.slice(0, 5)}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
