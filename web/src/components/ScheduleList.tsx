import { format } from "date-fns";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Workout } from "../types";

type Props = {
  workouts: Workout[];
};

export function ScheduleList({ workouts }: Props) {
  const grouped = workouts.reduce<Record<number, Workout[]>>((acc, workout) => {
    const list = acc[workout.week] ?? [];
    list.push(workout);
    acc[workout.week] = list;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {Object.keys(grouped)
        .map(Number)
        .sort((a, b) => a - b)
        .map((week) => {
          const items = grouped[week].sort(
            (a, b) =>
              new Date(a.start_date_local).getTime() - new Date(b.start_date_local).getTime()
          );
          return (
            <Card key={week}>
              <CardHeader>
                <CardTitle>Week {week}</CardTitle>
                <CardDescription>Focus on consistency and progressive load.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex flex-col gap-1 rounded-[10px] border border-[--border] bg-[--muted] px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{format(new Date(workout.start_date_local), "EEE d MMM HH:mm")}</Badge>
                      {workout.duration_minutes && (
                        <Badge className="bg-[--accent] text-[--accent-foreground]">
                          {workout.duration_minutes}m
                        </Badge>
                      )}
                      <span className="font-semibold">{workout.name}</span>
                    </div>
                    <p className="text-sm whitespace-pre-line text-[--subtle]">
                      {workout.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
