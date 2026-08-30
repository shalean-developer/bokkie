"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { BookFormState, BookServiceSlug, BookStep } from "@/lib/book/types";
import type { BookPricingConfig } from "@/lib/book/pricing-config";
import {
  createInitialBookState,
  loadBookState,
  saveBookState,
  captureUtmParams,
  detectDeviceType,
} from "@/lib/book/storage";
import { calculateBookPricing } from "@/lib/book/pricing";
import { getBookPricingConfig } from "@/app/actions/booking-data";

interface BookFormContextValue {
  state: BookFormState;
  updateState: (patch: Partial<BookFormState>) => void;
  setServiceDetails: (details: Record<string, unknown>) => void;
  setAddress: (address: Partial<BookFormState["address"]>) => void;
  setSchedule: (schedule: Partial<BookFormState["schedule"]>) => void;
  setRecurring: (recurring: Partial<BookFormState["recurring"]>) => void;
  setCustomer: (customer: Partial<BookFormState["customer"]>) => void;
  setExtras: (extras: string[]) => void;
  setExtraQuantity: (extraId: string, quantity: number) => void;
  refreshPricing: () => void;
  isHydrated: boolean;
  pricingLoaded: boolean;
}

const BookFormContext = createContext<BookFormContextValue | null>(null);

function recalculateWithLiveConfig(state: BookFormState): BookFormState {
  if (!state.pricingConfig) {
    return { ...state, pricingSummary: null };
  }

  try {
    return {
      ...state,
      pricingSummary: calculateBookPricing(state, state.pricingConfig),
    };
  } catch (error) {
    console.error("Booking pricing validation failed:", error);
    return { ...state, pricingSummary: null };
  }
}

export function BookFormProvider({
  service,
  children,
  initialStep,
}: {
  service: BookServiceSlug;
  children: React.ReactNode;
  initialStep?: BookStep;
}) {
  const [state, setState] = useState<BookFormState>(() => createInitialBookState(service));
  const [isHydrated, setIsHydrated] = useState(false);
  const [pricingLoaded, setPricingLoaded] = useState(false);
  const [pricingConfig, setPricingConfig] = useState<BookPricingConfig | undefined>();

  useEffect(() => {
    setPricingLoaded(false);
    setPricingConfig(undefined);
    getBookPricingConfig()
      .then((config) => setPricingConfig(config))
      .catch((error) => {
        console.error("Live booking pricing unavailable:", error);
        setPricingConfig(undefined);
      })
      .finally(() => setPricingLoaded(true));
  }, []);

  useEffect(() => {
    if (!pricingLoaded) return;

    const loaded = loadBookState(service);
    const utm = captureUtmParams();
    const next: BookFormState = {
      ...loaded,
      step: initialStep ?? loaded.step,
      pricingConfig,
      pricingSummary: null,
      tracking: {
        ...loaded.tracking,
        ...utm,
        deviceType: detectDeviceType(),
        servicePageRoute: `/book/${service}`,
        sourcePage: typeof document !== "undefined" ? document.referrer || "direct" : undefined,
      },
    };
    setState(recalculateWithLiveConfig(next));
    setIsHydrated(true);
  }, [service, initialStep, pricingLoaded, pricingConfig]);

  useEffect(() => {
    if (isHydrated) saveBookState(state);
  }, [state, isHydrated]);

  const refreshPricing = useCallback(() => {
    setState((prev) => recalculateWithLiveConfig(prev));
  }, []);

  const updateState = useCallback((patch: Partial<BookFormState>) => {
    setState((prev) => recalculateWithLiveConfig({ ...prev, ...patch }));
  }, []);

  const setServiceDetails = useCallback((details: Record<string, unknown>) => {
    setState((prev) =>
      recalculateWithLiveConfig({
        ...prev,
        serviceDetails: { ...prev.serviceDetails, ...details },
      })
    );
  }, []);

  const setAddress = useCallback((address: Partial<BookFormState["address"]>) => {
    setState((prev) => ({ ...prev, address: { ...prev.address, ...address } }));
  }, []);

  const setSchedule = useCallback((schedule: Partial<BookFormState["schedule"]>) => {
    setState((prev) =>
      recalculateWithLiveConfig({
        ...prev,
        schedule: { ...prev.schedule, ...schedule },
      })
    );
  }, []);

  const setRecurring = useCallback((recurring: Partial<BookFormState["recurring"]>) => {
    setState((prev) =>
      recalculateWithLiveConfig({
        ...prev,
        recurring: { ...prev.recurring, ...recurring },
      })
    );
  }, []);

  const setCustomer = useCallback((customer: Partial<BookFormState["customer"]>) => {
    setState((prev) => ({ ...prev, customer: { ...prev.customer, ...customer } }));
  }, []);

  const setExtras = useCallback((extras: string[]) => {
    setState((prev) => {
      const selected = new Set(extras);
      const extraQuantities = Object.fromEntries(
        extras.map((id) => [id, Math.max(1, Math.floor(Number(prev.extraQuantities[id] ?? 1)))])
      );
      return recalculateWithLiveConfig({
        ...prev,
        selectedExtras: [...selected],
        extraQuantities,
      });
    });
  }, []);

  const setExtraQuantity = useCallback((extraId: string, quantity: number) => {
    setState((prev) => {
      const safeQuantity = Math.max(0, Math.min(99, Math.floor(Number(quantity) || 0)));
      const selected = new Set(prev.selectedExtras);
      const extraQuantities = { ...prev.extraQuantities };

      if (safeQuantity > 0) {
        selected.add(extraId);
        extraQuantities[extraId] = safeQuantity;
      } else {
        selected.delete(extraId);
        delete extraQuantities[extraId];
      }

      return recalculateWithLiveConfig({
        ...prev,
        selectedExtras: Array.from(selected),
        extraQuantities,
      });
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
      setExtraQuantity,
      refreshPricing,
      isHydrated,
      pricingLoaded,
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
      setExtraQuantity,
      refreshPricing,
      isHydrated,
      pricingLoaded,
    ]
  );

  return <BookFormContext.Provider value={value}>{children}</BookFormContext.Provider>;
}

export function useBookForm() {
  const ctx = useContext(BookFormContext);
  if (!ctx) throw new Error("useBookForm must be used within BookFormProvider");
  return ctx;
}
