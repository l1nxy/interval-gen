import {
  addDays,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  startOfMonth,
} from "date-fns";
import { useMemo, useState } from "react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Modal } from "./ui/modal";
import { Workout } from "../types";

type Props = {
  workouts: Workout[];
};

export function CalendarView({ workouts }: Props) {
  const sorted = useMemo(
    () =>
      [...workouts].sort(
        (a, b) =>
          new Date(a.start_date_local).getTime() - new Date(b.start_date_local).getTime()
      ),
    [workouts]
  );

  const anchor = sorted[0] ? new Date(sorted[0].start_date_local) : new Date();
  const start = startOfMonth(anchor);
  const end = endOfMonth(anchor);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const days: Date[] = [];
  // Pad with previous month days to align Monday start
  const offset = (getDay(start) + 6) % 7; // convert Sunday=0 to Monday=0
  for (let i = offset; i > 0; i--) {
    days.push(addDays(start, -i));
  }
  for (let d = start; d <= end; d = addDays(d, 1)) {
    days.push(d);
  }

  const label = format(anchor, "MMMM yyyy");
  const selectedWorkouts = selectedDate
    ? workouts.filter((w) => isSameDay(new Date(w.start_date_local), selectedDate))
    : [];
  const formatDuration = (w: Workout) =>
    w.duration_minutes ? `${w.duration_minutes}m` : "—";

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-baseline justify-between">
            <span>{label}</span>
            <span className="text-sm text-[--subtle]">Tap a day to see workouts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase text-[--subtle]">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="calendar-grid mt-2">
            {days.map((day) => {
              const dayWorkouts = workouts.filter((w) =>
                isSameDay(new Date(w.start_date_local), day)
              );
              const isCurrentMonth = day.getMonth() === anchor.getMonth();
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={
                    "flex min-h-[110px] cursor-pointer flex-col gap-1 rounded-[10px] border border-[--border] bg-[--card] px-2 py-2 transition-all hover:border-[--accent]" +
                    (!isCurrentMonth ? " opacity-60" : "")
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{format(day, "d")}</span>
                    {dayWorkouts.length > 0 && (
                      <Badge className="bg-[--accent] text-[--accent-foreground]">
                        {dayWorkouts.length}x
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-left">
                    {dayWorkouts.map((w) => (
                      <div
                        key={w.id}
                        className="rounded-[8px] bg-[--muted] px-2 py-1 text-xs font-medium"
                      >
                        <div className="text-left">{w.name}</div>
                        <div className="text-left text-[--subtle]">
                          {format(new Date(w.start_date_local), "HH:mm")} · {formatDuration(w)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Modal
        open={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={
          selectedDate ? `Workouts on ${format(selectedDate, "EEE, d MMM yyyy")}` : undefined
        }
      >
        {selectedDate && selectedWorkouts.length === 0 && (
          <p className="text-sm text-[--subtle]">No workouts scheduled.</p>
        )}
        {selectedDate &&
          selectedWorkouts.map((w, idx) => (
            <div
              key={w.id}
              className="rounded-[12px] border border-[--border] bg-[--muted] px-3 py-2"
              style={{ marginBottom: idx === selectedWorkouts.length - 1 ? 0 : "0.5rem" }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{format(new Date(w.start_date_local), "HH:mm")}</Badge>
                <Badge className="bg-[--accent] text-[--accent-foreground]">
                  {formatDuration(w)}
                </Badge>
                <span className="font-semibold">{w.name}</span>
              </div>
              <p className="mt-1 text-sm whitespace-pre-line text-[--subtle]">
                {w.description}
              </p>
            </div>
          ))}
      </Modal>
    </>
  );
}
