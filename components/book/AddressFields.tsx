"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin } from "lucide-react";
import type { BookFormState } from "@/lib/book/types";

interface AddressFieldsProps {
  address: BookFormState["address"];
  onChange: (field: keyof BookFormState["address"], value: string) => void;
  errors?: Record<string, string>;
}

export function AddressFields({ address, onChange, errors = {} }: AddressFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-brand-primary font-medium">
        <MapPin className="w-4 h-4 text-brand-accent" />
        Property address
      </div>
      <div>
        <Label htmlFor="addressLine">Street address</Label>
        <Input id="addressLine" className="mt-1.5" value={address.addressLine} onChange={(e) => onChange("addressLine", e.target.value)} placeholder="123 Main Road" />
        {errors.addressLine && <p className="text-xs text-red-600 mt-1">{errors.addressLine}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="suburb">Suburb</Label>
          <Input id="suburb" className="mt-1.5" value={address.suburb} onChange={(e) => onChange("suburb", e.target.value)} />
          {errors.suburb && <p className="text-xs text-red-600 mt-1">{errors.suburb}</p>}
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" className="mt-1.5" value={address.city} onChange={(e) => onChange("city", e.target.value)} />
          {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="postalCode">Postal code</Label>
        <Input id="postalCode" className="mt-1.5 max-w-xs" value={address.postalCode} onChange={(e) => onChange("postalCode", e.target.value)} />
        {errors.postalCode && <p className="text-xs text-red-600 mt-1">{errors.postalCode}</p>}
      </div>
      <div>
        <Label htmlFor="access">Property access instructions</Label>
        <Textarea id="access" className="mt-1.5" value={address.accessInstructions ?? ""} onChange={(e) => onChange("accessInstructions", e.target.value)} placeholder="How should cleaners access the property?" />
      </div>
      <div>
        <Label htmlFor="parking">Parking instructions</Label>
        <Textarea id="parking" className="mt-1.5" value={address.parkingInstructions ?? ""} onChange={(e) => onChange("parkingInstructions", e.target.value)} placeholder="Visitor parking, street parking, etc." />
      </div>
      <div>
        <Label htmlFor="security">Security / gate code</Label>
        <Input id="security" className="mt-1.5 max-w-sm" value={address.securityCode ?? ""} onChange={(e) => onChange("securityCode", e.target.value)} placeholder="If applicable" />
      </div>
    </div>
  );
}
