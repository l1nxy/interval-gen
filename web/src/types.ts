export type Workout = {
  id: string;
  week: number;
  day_of_week: number;
  name: string;
  description: string;
  type: string;
  category: string;
  start_date_local: string;
  duration_minutes?: number;
};
