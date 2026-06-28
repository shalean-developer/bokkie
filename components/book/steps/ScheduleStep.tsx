"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookForm } from "../BookFormProvider";
import { PriceSummaryCard } from "../PriceSummaryCard";
import { getServiceConfig, usesTeamSelection } from "@/lib/book/services";
import { scheduleSchema, recurringSchema } from "@/lib/book/schemas";
import { TIME_SLOTS, WEEK_DAYS, MAX_CLEANERS } from "@/lib/book/constants";
import { checkTeamAvailability } from "@/app/actions/book-v2";
import type { WeekDay } from "@/lib/book/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, Calendar, Users, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScheduleStep() {
  const { state, setSchedule, setRecurring } = useBookForm();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [teamLoading, setTeamLoading] = useState(false);
  const [availableTeams, setAvailableTeams] = useState<{ id: string; teamName: string }[]>([]);
  const [noSlot, setNoSlot] = useState(false);
  const config = getServiceConfig(state.service);
  const isTeamService = usesTeamSelection(state.service);

  useEffect(() => {
    if (!isTeamService || !state.schedule.serviceDate) {
      setAvailableTeams([]);
      setNoSlot(false);
      return;
    }
    setTeamLoading(true);
    checkTeamAvailability(state.schedule.serviceDate, state.schedule.assignedTeamId).then((res) => {
      setAvailableTeams(res.availableTeams);
      setNoSlot(!res.available);
      if (!res.available) {
        setSchedule({ assignedTeamId: undefined });
      }
      setTeamLoading(false);
    });
  }, [isTeamService, state.schedule.serviceDate, state.schedule.assignedTeamId, setSchedule]);

  const handleBookingTypeChange = (type: "once-off" | "recurring") => {
    setSchedule({ bookingType: type });
    setRecurring({ isRecurring: type === "recurring" });
  };

  const toggleRecurringDay = (day: WeekDay) => {
    const current = state.recurring.recurringDays ?? [];
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    setRecurring({ recurringDays: next });
  };

  const handleNext = () => {
    const schedResult = scheduleSchema.safeParse(state.schedule);
    const recResult = state.recurring.isRecurring
      ? recurringSchema.safeParse(state.recurring)
      : { success: true as const };

    const fieldErrors: Record<string, string> = {};
    if (!schedResult.success) {
      schedResult.error.issues.forEach((i) => {
        const key = String(i.path[0]);
        fieldErrors[key] = i.message;
      });
    }
    if (!recResult.success && "error" in recResult) {
      recResult.error.issues.forEach((i) => {
        const key = String(i.path[0]);
        fieldErrors[key] = i.message;
      });
    }
    if (isTeamService && noSlot) {
      fieldErrors.serviceDate = "No slot available for this date";
    }
    if (isTeamService && !state.schedule.assignedTeamId && !noSlot) {
      fieldErrors.assignedTeamId = "Please select an available team";
    }

    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    router.push(`/book/${state.service}/review`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-accent" />
              Date & time
            </CardTitle>
            <CardDescription>Choose when you&apos;d like your cleaning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Booking type</Label>
              <RadioGroup
                className="mt-2 flex flex-wrap gap-4"
                value={state.schedule.bookingType}
                onValueChange={(v) => handleBookingTypeChange(v as "once-off" | "recurring")}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="once-off" id="once-off" />
                  <Label htmlFor="once-off" className="font-normal">Once-off</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="recurring" id="recurring" />
                  <Label htmlFor="recurring" className="font-normal">Recurring</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Preferred date</Label>
                <Input type="date" className="mt-1.5" min={new Date().toISOString().split("T")[0]} value={state.schedule.serviceDate} onChange={(e) => setSchedule({ serviceDate: e.target.value })} />
                {errors.serviceDate && <p className="text-xs text-red-600 mt-1">{errors.serviceDate}</p>}
              </div>
              <div>
                <Label>Preferred time</Label>
                <Select value={state.schedule.serviceTime} onValueChange={(v) => setSchedule({ serviceTime: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select time" /></SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.serviceTime && <p className="text-xs text-red-600 mt-1">{errors.serviceTime}</p>}
              </div>
              <div>
                <Label>Alternative date (optional)</Label>
                <Input type="date" className="mt-1.5" value={state.schedule.alternativeDate ?? ""} onChange={(e) => setSchedule({ alternativeDate: e.target.value })} />
              </div>
              <div>
                <Label>Alternative time (optional)</Label>
                <Select value={state.schedule.alternativeTime ?? ""} onValueChange={(v) => setSchedule({ alternativeTime: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {state.recurring.isRecurring && (
              <div className="rounded-xl border border-brand-accent/20 bg-brand-surface p-4 space-y-4">
                <p className="text-sm font-medium text-brand-primary">Recurring schedule</p>
                <div>
                  <Label>Frequency</Label>
                  <Select value={state.recurring.frequency ?? ""} onValueChange={(v) => setRecurring({ frequency: v as typeof state.recurring.frequency })}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select frequency" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="custom">Custom days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(state.recurring.frequency === "custom" || state.recurring.frequency === "weekly") && (
                  <div>
                    <Label>Recurring days</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {WEEK_DAYS.map((d) => {
                        const selected = (state.recurring.recurringDays ?? []).includes(d.id);
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => toggleRecurringDay(d.id)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-colors",
                              selected ? "border-brand-primary bg-brand-primary text-white" : "border-gray-200 text-gray-600 hover:border-brand-accent"
                            )}
                          >
                            {d.short}
                          </button>
                        );
                      })}
                    </div>
                    {errors.recurringDays && <p className="text-xs text-red-600 mt-1">{errors.recurringDays}</p>}
                    <p className="text-xs text-gray-500 mt-2">e.g. Monday, Wednesday & Friday every week</p>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Start date</Label>
                    <Input type="date" className="mt-1.5" value={state.recurring.recurringStartDate ?? ""} onChange={(e) => setRecurring({ recurringStartDate: e.target.value })} />
                  </div>
                  <div>
                    <Label>End date (optional)</Label>
                    <Input type="date" className="mt-1.5" value={state.recurring.recurringEndDate ?? ""} onChange={(e) => setRecurring({ recurringEndDate: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Schedule notes</Label>
                  <Textarea className="mt-1.5" value={state.recurring.recurringNotes ?? ""} onChange={(e) => setRecurring({ recurringNotes: e.target.value })} placeholder="Any notes about your recurring schedule" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-accent" />
              {isTeamService ? "Team selection" : "Cleaner count"}
            </CardTitle>
            <CardDescription>
              {isTeamService
                ? "Deep & moving cleans use dedicated teams (max 3 per day)"
                : "Add extra cleaners for larger jobs (max 3 total)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isTeamService ? (
              <div className="space-y-3">
                {teamLoading && <p className="text-sm text-gray-500">Checking availability...</p>}
                {noSlot && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No slot available</AlertTitle>
                    <AlertDescription>All 3 teams are booked for this date. Please choose another date.</AlertDescription>
                  </Alert>
                )}
                {!noSlot && availableTeams.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => setSchedule({ assignedTeamId: team.id })}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-colors",
                      state.schedule.assignedTeamId === team.id
                        ? "border-brand-primary bg-brand-surface"
                        : "border-gray-200 hover:border-brand-accent"
                    )}
                  >
                    <p className="font-semibold text-brand-primary">{team.teamName}</p>
                    <p className="text-sm text-gray-500">Available for {config.shortTitle} cleaning</p>
                  </button>
                ))}
                {errors.assignedTeamId && <p className="text-xs text-red-600">{errors.assignedTeamId}</p>}
              </div>
            ) : (
              <div className="flex gap-3">
                {[1, 2, 3].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setSchedule({ cleanerCount: count })}
                    className={cn(
                      "flex-1 p-4 rounded-xl border-2 text-center transition-colors",
                      state.schedule.cleanerCount === count
                        ? "border-brand-primary bg-brand-surface"
                        : "border-gray-200 hover:border-brand-accent"
                    )}
                  >
                    <p className="text-2xl font-bold text-brand-primary">{count}</p>
                    <p className="text-xs text-gray-500">{count === 1 ? "cleaner" : "cleaners"}</p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between gap-4">
          <Button variant="outline" onClick={() => router.push(`/book/${state.service}`)}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button size="lg" onClick={handleNext} disabled={isTeamService && noSlot}>
            Continue to Review <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="hidden lg:block">
        <PriceSummaryCard pricing={state.pricingSummary} serviceTitle={config.title} />
      </div>
    </div>
  );
}
