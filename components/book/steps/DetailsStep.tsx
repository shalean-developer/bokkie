"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBookForm } from "../BookFormProvider";
import { ServiceQuestions } from "../ServiceQuestions";
import { AddressFields } from "../AddressFields";
import { PriceSummaryCard } from "../PriceSummaryCard";
import { getServiceConfig } from "@/lib/book/services";
import { getDetailsSchema } from "@/lib/book/schemas";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home } from "lucide-react";

export function DetailsStep() {
  const { state, setServiceDetails, setAddress } = useBookForm();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const config = getServiceConfig(state.service);

  const handleNext = () => {
    const schema = getDetailsSchema(state.service);
    const result = schema.safeParse({
      serviceDetails: state.serviceDetails,
      address: state.address,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.slice(-1)[0];
        if (path) fieldErrors[String(path)] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    router.push(`/book/${state.service}/schedule`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-brand-accent" />
              {config.title} details
            </CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ServiceQuestions
              service={state.service}
              details={state.serviceDetails as Record<string, unknown>}
              onChange={(field, value) => setServiceDetails({ [field]: value })}
              errors={errors}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <AddressFields
              address={state.address}
              onChange={(field, value) => setAddress({ [field]: value })}
              errors={errors}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button size="lg" onClick={handleNext}>
            Continue to Schedule
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="hidden lg:block">
        <PriceSummaryCard pricing={state.pricingSummary} serviceTitle={config.title} />
      </div>
    </div>
  );
}
