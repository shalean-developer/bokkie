import type { BookStep, WeekDay } from "./types";

export const BOOK_STEPS: { id: BookStep; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "schedule", label: "Schedule" },
  { id: "review", label: "Review" },
  { id: "payment", label: "Payment" },
];

export const WEEK_DAYS: { id: WeekDay; label: string; short: string }[] = [
  { id: "monday", label: "Monday", short: "Mon" },
  { id: "tuesday", label: "Tuesday", short: "Tue" },
  { id: "wednesday", label: "Wednesday", short: "Wed" },
  { id: "thursday", label: "Thursday", short: "Thu" },
  { id: "friday", label: "Friday", short: "Fri" },
  { id: "saturday", label: "Saturday", short: "Sat" },
  { id: "sunday", label: "Sunday", short: "Sun" },
];

export const TIME_SLOTS = [
  "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
];

export const PROPERTY_TYPES = [
  "Apartment",
  "House",
  "Townhouse",
  "Studio",
  "Office",
  "Other",
];

export const MAX_TEAM_BOOKINGS_PER_DAY = 3;
export const MAX_CLEANERS = 3;
export const MIN_CLEANERS = 1;
export const EXTRA_CLEANER_PRICE = 150;

export const BOOK_STORAGE_KEY = "bokkie_book_v2_data";

export const DEFAULT_TEAMS = [
  { id: "team-a", teamName: "Team 1" },
  { id: "team-b", teamName: "Team 2" },
  { id: "team-c", teamName: "Team 3" },
];
