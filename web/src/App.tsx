import { useEffect, useMemo, useState } from "react";
import "./index.css";
import { Tabs, TabsContent } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { ScheduleList } from "./components/ScheduleList";
import { CalendarView } from "./components/CalendarView";
import { sampleWorkouts } from "./lib/sample-data";
import { Workout } from "./types";
import { CalendarClock, List, Moon, Sun } from "lucide-react";

function normalizeWorkouts(data: Workout[]): Workout[] {
  return data.map((w, idx) => ({
    ...w,
    id: w.id || `${w.week}-${w.day_of_week}-${idx}`,
    start_date_local: w.start_date_local,
  }));
}

export default function App() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const workouts = useMemo(() => normalizeWorkouts(sampleWorkouts), []);
  const totalWeeks = Math.max(...workouts.map((w) => w.week));

  useEffect(() => {
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(theme === "light" ? "theme-light" : "theme-dark");
  }, [theme]);

  return (
    <div className="app-shell">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[--subtle]">Training</p>
          <h1 className="text-3xl font-bold">16-Week Running Plan</h1>
          <p className="text-sm text-[--subtle]">
            Structured schedule aggregated from the generator outputs. Weeks: {totalWeeks}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Export as JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="flex items-center gap-2"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === "light" ? "Light" : "Dark"}</span>
          </Button>
        </div>
      </div>

      <Tabs
        tabs={[
          { value: "list", label: "List", icon: <List size={16} /> },
          { value: "calendar", label: "Calendar", icon: <CalendarClock size={16} /> },
        ]}
        value={view}
        onValueChange={(v) => setView(v as "list" | "calendar")}
      />

      <TabsContent value="list" activeValue={view}>
        <ScheduleList workouts={workouts} />
      </TabsContent>

      <TabsContent value="calendar" activeValue={view}>
        <CalendarView workouts={workouts} />
      </TabsContent>
    </div>
  );
}
