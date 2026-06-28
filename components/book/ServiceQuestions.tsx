"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PROPERTY_TYPES } from "@/lib/book/constants";
import type { BookServiceSlug } from "@/lib/book/types";

interface ServiceQuestionsProps {
  service: BookServiceSlug;
  details: Record<string, unknown>;
  onChange: (field: string, value: unknown) => void;
  errors?: Record<string, string>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-600 mt-1">{message}</p>;
}

function PropertyTypeSelect({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <Label>Property type</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-1.5">
          <SelectValue placeholder="Select property type" />
        </SelectTrigger>
        <SelectContent>
          {PROPERTY_TYPES.map((t) => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError message={error} />
    </div>
  );
}

function BoolField({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      <Label htmlFor={id} className="font-normal cursor-pointer">{label}</Label>
    </div>
  );
}

export function ServiceQuestions({ service, details, onChange, errors = {} }: ServiceQuestionsProps) {
  switch (service) {
    case "airbnb-cleaning":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><PropertyTypeSelect value={String(details.propertyType ?? "")} onChange={(v) => onChange("propertyType", v)} error={errors.propertyType} /></div>
          <div><Label>Bedrooms</Label><Input type="number" min={0} className="mt-1.5" value={Number(details.bedrooms ?? 1)} onChange={(e) => onChange("bedrooms", Number(e.target.value))} /></div>
          <div><Label>Bathrooms</Label><Input type="number" min={1} className="mt-1.5" value={Number(details.bathrooms ?? 1)} onChange={(e) => onChange("bathrooms", Number(e.target.value))} /></div>
          <div><Label>Check-in time</Label><Input type="time" className="mt-1.5" value={String(details.checkInTime ?? "")} onChange={(e) => onChange("checkInTime", e.target.value)} /></div>
          <div><Label>Check-out time</Label><Input type="time" className="mt-1.5" value={String(details.checkOutTime ?? "")} onChange={(e) => onChange("checkOutTime", e.target.value)} /></div>
          <div><Label>Airbnb units</Label><Input type="number" min={1} className="mt-1.5" value={Number(details.airbnbUnits ?? 1)} onChange={(e) => onChange("airbnbUnits", Number(e.target.value))} /></div>
          <div className="sm:col-span-2 space-y-1">
            <BoolField id="linen" label="Linen change required?" checked={Boolean(details.linenChangeRequired)} onChange={(v) => onChange("linenChangeRequired", v)} />
            <BoolField id="restock" label="Restocking required?" checked={Boolean(details.restockingRequired)} onChange={(v) => onChange("restockingRequired", v)} />
            <BoolField id="inspection" label="Guest-ready inspection required?" checked={Boolean(details.guestReadyInspection)} onChange={(v) => onChange("guestReadyInspection", v)} />
          </div>
        </div>
      );

    case "carpet-cleaning":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Number of rooms</Label><Input type="number" min={1} className="mt-1.5" value={Number(details.numberOfRooms ?? 1)} onChange={(e) => onChange("numberOfRooms", Number(e.target.value))} /></div>
          <div><Label>Carpeted area size</Label><Input placeholder="e.g. 80 sqm" className="mt-1.5" value={String(details.carpetedAreaSize ?? "")} onChange={(e) => onChange("carpetedAreaSize", e.target.value)} /><FieldError message={errors.carpetedAreaSize} /></div>
          <div className="sm:col-span-2"><PropertyTypeSelect value={String(details.propertyType ?? "")} onChange={(v) => onChange("propertyType", v)} error={errors.propertyType} /></div>
          <div className="sm:col-span-2"><Label>Carpet condition</Label><Input placeholder="Good / Fair / Heavy wear" className="mt-1.5" value={String(details.carpetCondition ?? "")} onChange={(e) => onChange("carpetCondition", e.target.value)} /><FieldError message={errors.carpetCondition} /></div>
          <div className="sm:col-span-2 space-y-1">
            <BoolField id="stain" label="Stain treatment needed?" checked={Boolean(details.stainTreatmentNeeded)} onChange={(v) => onChange("stainTreatmentNeeded", v)} />
            <BoolField id="odor" label="Pet odor treatment needed?" checked={Boolean(details.petOdorTreatmentNeeded)} onChange={(v) => onChange("petOdorTreatmentNeeded", v)} />
            <BoolField id="furniture" label="Furniture moving required?" checked={Boolean(details.furnitureMovingRequired)} onChange={(v) => onChange("furnitureMovingRequired", v)} />
          </div>
        </div>
      );

    case "deep-cleaning":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><PropertyTypeSelect value={String(details.propertyType ?? "")} onChange={(v) => onChange("propertyType", v)} error={errors.propertyType} /></div>
          <div><Label>Bedrooms</Label><Input type="number" min={0} className="mt-1.5" value={Number(details.bedrooms ?? 2)} onChange={(e) => onChange("bedrooms", Number(e.target.value))} /></div>
          <div><Label>Bathrooms</Label><Input type="number" min={1} className="mt-1.5" value={Number(details.bathrooms ?? 1)} onChange={(e) => onChange("bathrooms", Number(e.target.value))} /></div>
          <div className="sm:col-span-2"><Label>Property condition</Label><Input placeholder="Good / Needs attention / Heavy" className="mt-1.5" value={String(details.propertyCondition ?? "")} onChange={(e) => onChange("propertyCondition", e.target.value)} /><FieldError message={errors.propertyCondition} /></div>
          <div className="sm:col-span-2 grid sm:grid-cols-2 gap-2">
            <BoolField id="kitchen" label="Kitchen deep clean required?" checked={Boolean(details.kitchenDeepClean)} onChange={(v) => onChange("kitchenDeepClean", v)} />
            <BoolField id="oven" label="Oven cleaning required?" checked={Boolean(details.ovenCleaning)} onChange={(v) => onChange("ovenCleaning", v)} />
            <BoolField id="fridge" label="Fridge cleaning required?" checked={Boolean(details.fridgeCleaning)} onChange={(v) => onChange("fridgeCleaning", v)} />
            <BoolField id="windows" label="Window cleaning required?" checked={Boolean(details.windowCleaning)} onChange={(v) => onChange("windowCleaning", v)} />
          </div>
        </div>
      );

    case "moving-cleaning":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Move type</Label>
            <RadioGroup className="mt-2 flex gap-4" value={String(details.moveType ?? "move-out")} onValueChange={(v) => onChange("moveType", v)}>
              <div className="flex items-center gap-2"><RadioGroupItem value="move-in" id="move-in" /><Label htmlFor="move-in" className="font-normal">Move-in</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="move-out" id="move-out" /><Label htmlFor="move-out" className="font-normal">Move-out</Label></div>
            </RadioGroup>
          </div>
          <div className="sm:col-span-2"><PropertyTypeSelect value={String(details.propertyType ?? "")} onChange={(v) => onChange("propertyType", v)} error={errors.propertyType} /></div>
          <div><Label>Bedrooms</Label><Input type="number" min={0} className="mt-1.5" value={Number(details.bedrooms ?? 2)} onChange={(e) => onChange("bedrooms", Number(e.target.value))} /></div>
          <div><Label>Bathrooms</Label><Input type="number" min={1} className="mt-1.5" value={Number(details.bathrooms ?? 1)} onChange={(e) => onChange("bathrooms", Number(e.target.value))} /></div>
          <div className="sm:col-span-2 space-y-1">
            <BoolField id="empty" label="Is the property empty?" checked={Boolean(details.propertyEmpty)} onChange={(v) => onChange("propertyEmpty", v)} />
            <BoolField id="appliance" label="Appliance cleaning required?" checked={Boolean(details.applianceCleaning)} onChange={(v) => onChange("applianceCleaning", v)} />
            <BoolField id="walls" label="Wall spot-cleaning required?" checked={Boolean(details.wallSpotCleaning)} onChange={(v) => onChange("wallSpotCleaning", v)} />
          </div>
          <div className="sm:col-span-2"><Label>Keys / access instructions</Label><Textarea className="mt-1.5" value={String(details.keysAccessInstructions ?? "")} onChange={(e) => onChange("keysAccessInstructions", e.target.value)} /></div>
        </div>
      );

    case "office-cleaning":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Office size</Label>
            <Select value={String(details.officeSize ?? "")} onValueChange={(v) => onChange("officeSize", v)}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select size" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (up to 100 sqm)</SelectItem>
                <SelectItem value="medium">Medium (100–300 sqm)</SelectItem>
                <SelectItem value="large">Large (300+ sqm)</SelectItem>
              </SelectContent>
            </Select>
            <FieldError message={errors.officeSize} />
          </div>
          <div><Label>Workstations</Label><Input type="number" min={1} className="mt-1.5" value={Number(details.workstations ?? 5)} onChange={(e) => onChange("workstations", Number(e.target.value))} /></div>
          <div><Label>Bathrooms</Label><Input type="number" min={0} className="mt-1.5" value={Number(details.bathrooms ?? 1)} onChange={(e) => onChange("bathrooms", Number(e.target.value))} /></div>
          <div><Label>Cleaning frequency</Label>
            <Select value={String(details.cleaningFrequency ?? "")} onValueChange={(v) => onChange("cleaningFrequency", v)}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select frequency" /></SelectTrigger>
              <SelectContent>
                {["Daily", "Weekly", "Bi-weekly", "Monthly", "Once-off"].map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2 space-y-1">
            <BoolField id="kitchen-br" label="Kitchen/breakroom included?" checked={Boolean(details.kitchenBreakroomIncluded)} onChange={(v) => onChange("kitchenBreakroomIncluded", v)} />
            <BoolField id="after-hours" label="After-hours cleaning required?" checked={Boolean(details.afterHoursRequired)} onChange={(v) => onChange("afterHoursRequired", v)} />
            <BoolField id="waste" label="Waste removal required?" checked={Boolean(details.wasteRemovalRequired)} onChange={(v) => onChange("wasteRemovalRequired", v)} />
          </div>
        </div>
      );

    case "regular-cleaning":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><PropertyTypeSelect value={String(details.propertyType ?? "")} onChange={(v) => onChange("propertyType", v)} error={errors.propertyType} /></div>
          <div><Label>Bedrooms</Label><Input type="number" min={0} className="mt-1.5" value={Number(details.bedrooms ?? 2)} onChange={(e) => onChange("bedrooms", Number(e.target.value))} /></div>
          <div><Label>Bathrooms</Label><Input type="number" min={1} className="mt-1.5" value={Number(details.bathrooms ?? 1)} onChange={(e) => onChange("bathrooms", Number(e.target.value))} /></div>
          <div className="sm:col-span-2"><Label>Cleaning frequency</Label>
            <Select value={String(details.cleaningFrequency ?? "")} onValueChange={(v) => onChange("cleaningFrequency", v)}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="How often?" /></SelectTrigger>
              <SelectContent>
                {["Weekly", "Bi-weekly", "Monthly", "Once-off"].map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={errors.cleaningFrequency} />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <BoolField id="pets" label="Pets in the home?" checked={Boolean(details.petsInHome)} onChange={(v) => onChange("petsInHome", v)} />
            <BoolField id="supplies" label="Supplies provided by customer?" checked={Boolean(details.suppliesProvidedByCustomer)} onChange={(v) => onChange("suppliesProvidedByCustomer", v)} />
          </div>
          <div className="sm:col-span-2"><Label>Preferred cleaner notes</Label><Textarea className="mt-1.5" placeholder="Optional preferences..." value={String(details.preferredCleanerNotes ?? "")} onChange={(e) => onChange("preferredCleanerNotes", e.target.value)} /></div>
        </div>
      );
  }
}
