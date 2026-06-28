"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { BookFormState, BookServiceSlug, BookStep } from "@/lib/book/types";
import {
  loadBookState,
  saveBookState,
  captureUtmParams,
  detectDeviceType,
} from "@/lib/book/storage";
import { calculateBookPricing } from "@/lib/book/pricing";

interface BookFormContextValue {
  state: BookFormState;
  updateState: (patch: Partial<BookFormState>) => void;
  setServiceDetails: (details: Record<string, unknown>) => void;
  setAddress: (address: Partial<BookFormState["address"]>) => void;
  setSchedule: (schedule: Partial<BookFormState["schedule"]>) => void;
  setRecurring: (recurring: Partial<BookFormState["recurring"]>) => void;
  setCustomer: (customer: Partial<BookFormState["customer"]>) => void;
  setExtras: (extras: string[]) => void;
  refreshPricing: () => void;
  isHydrated: boolean;
}

const BookFormContext = createContext<BookFormContextValue | null>(null);

export function BookFormProvider({
  service,
  children,
  initialStep,
}: {
  service: BookServiceSlug;
  children: React.ReactNode;
  initialStep?: BookStep;
}) {
  const [state, setState] = useState<BookFormState>(() => loadBookState(service));
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadBookState(service);
    const utm = captureUtmParams();
    setState((prev) => ({
      ...loaded,
      step: initialStep ?? loaded.step,
      tracking: {
        ...loaded.tracking,
        ...utm,
        deviceType: detectDeviceType(),
        servicePageRoute: `/book/${service}`,
        sourcePage: typeof document !== "undefined" ? document.referrer || "direct" : undefined,
      },
    }));
    setIsHydrated(true);
  }, [service, initialStep]);

  useEffect(() => {
    if (isHydrated) saveBookState(state);
  }, [state, isHydrated]);

  const refreshPricing = useCallback(() => {
    setState((prev) => ({
      ...prev,
      pricingSummary: calculateBookPricing(prev),
    }));
  }, []);

  const updateState = useCallback((patch: Partial<BookFormState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      next.pricingSummary = calculateBookPricing(next);
      return next;
    });
  }, []);

  const setServiceDetails = useCallback((details: Record<string, unknown>) => {
    setState((prev) => {
      const next = { ...prev, serviceDetails: { ...prev.serviceDetails, ...details } };
      next.pricingSummary = calculateBookPricing(next);
      return next;
    });
  }, []);

  const setAddress = useCallback((address: Partial<BookFormState["address"]>) => {
    setState((prev) => ({ ...prev, address: { ...prev.address, ...address } }));
  }, []);

  const setSchedule = useCallback((schedule: Partial<BookFormState["schedule"]>) => {
    setState((prev) => {
      const next = { ...prev, schedule: { ...prev.schedule, ...schedule } };
      next.pricingSummary = calculateBookPricing(next);
      return next;
    });
  }, []);

  const setRecurring = useCallback((recurring: Partial<BookFormState["recurring"]>) => {
    setState((prev) => {
      const next = { ...prev, recurring: { ...prev.recurring, ...recurring } };
      next.pricingSummary = calculateBookPricing(next);
      return next;
    });
  }, []);

  const setCustomer = useCallback((customer: Partial<BookFormState["customer"]>) => {
    setState((prev) => ({ ...prev, customer: { ...prev.customer, ...customer } }));
  }, []);

  const setExtras = useCallback((extras: string[]) => {
    setState((prev) => {
      const next = { ...prev, selectedExtras: extras };
      next.pricingSummary = calculateBookPricing(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      state,
      updateState,
      setServiceDetails,
      setAddress,
      setSchedule,
      setRecurring,
      setCustomer,
      setExtras,
      refreshPricing,
      isHydrated,
    }),
    [
      state,
      updateState,
      setServiceDetails,
      setAddress,
      setSchedule,
      setRecurring,
      setCustomer,
      setExtras,
      refreshPricing,
      isHydrated,
    ]
  );

  return <BookFormContext.Provider value={value}>{children}</BookFormContext.Provider>;
}

export function useBookForm() {
  const ctx = useContext(BookFormContext);
  if (!ctx) throw new Error("useBookForm must be used within BookFormProvider");
  return ctx;
}
