"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import {
  saveBooking,
  generateBookingReference,
} from "@/lib/storage/bookings-supabase";
import { getPaystackPublicKey, getPaystackConfigError, getPaystackSecretKey } from "@/lib/paystack-config";
import { verifyPayment } from "@/lib/paystack";
import { mapBookFormStateToBooking, getBookV2ExtensionPayload } from "@/lib/book/map-booking";
import type { BookFormState, TeamAvailabilityResult } from "@/lib/book/types";
import { MAX_TEAM_BOOKINGS_PER_DAY, DEFAULT_TEAMS } from "@/lib/book/constants";
import { normalizeCleanerPreference, type Booking } from "@/lib/types/booking";

const TEAM_SERVICE_TYPES = ["deep", "move-in-out"];

export async function checkTeamAvailability(
  serviceDate: string,
  excludeTeamId?: string
): Promise<TeamAvailabilityResult> {
  if (!serviceDate) {
    return {
      available: false,
      availableTeams: [],
      bookedCount: 0,
      maxTeams: MAX_TEAM_BOOKINGS_PER_DAY,
      message: "Please select a date",
    };
  }

  try {
    const supabase = createServiceRoleClient();
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("team_id, service_type, status, payment_status")
      .eq("scheduled_date", serviceDate)
      .in("service_type", TEAM_SERVICE_TYPES)
      .in("status", ["pending", "confirmed", "pending_payment"])
      .not("team_id", "is", null);

    if (error) {
      console.error("Team availability check error:", error);
      return {
        available: true,
        availableTeams: DEFAULT_TEAMS.map((t) => ({ id: t.id, teamName: t.teamName })),
        bookedCount: 0,
        maxTeams: MAX_TEAM_BOOKINGS_PER_DAY,
      };
    }

    const bookedTeamIds = new Set(
      (bookings ?? [])
        .filter((b) => b.payment_status !== "failed")
        .map((b) => b.team_id as string)
    );

    const bookedCount = bookedTeamIds.size;

    if (bookedCount >= MAX_TEAM_BOOKINGS_PER_DAY) {
      return {
        available: false,
        availableTeams: [],
        bookedCount,
        maxTeams: MAX_TEAM_BOOKINGS_PER_DAY,
        message: "No slot available for this date",
      };
    }

    const availableTeams = DEFAULT_TEAMS.filter(
      (t) => !bookedTeamIds.has(t.id) || t.id === excludeTeamId
    ).map((t) => ({ id: t.id, teamName: t.teamName }));

    return {
      available: availableTeams.length > 0,
      availableTeams,
      bookedCount,
      maxTeams: MAX_TEAM_BOOKINGS_PER_DAY,
      message:
        availableTeams.length === 0 ? "No slot available for this date" : undefined,
    };
  } catch (err) {
    console.error(err);
    return {
      available: true,
      availableTeams: DEFAULT_TEAMS.map((t) => ({ id: t.id, teamName: t.teamName })),
      bookedCount: 0,
      maxTeams: MAX_TEAM_BOOKINGS_PER_DAY,
    };
  }
}

function bookingToUpdateRow(booking: Booking) {
  const normalizedPreference = normalizeCleanerPreference(booking.cleanerPreference);
  const isTeamPreference = normalizedPreference.startsWith("team-");
  const teamId = isTeamPreference ? normalizedPreference : null;
  const assignedCleanerId =
    !isTeamPreference && normalizedPreference !== "no-preference"
      ? normalizedPreference
      : null;

  return {
    service_type: booking.service,
    frequency: booking.frequency,
    scheduled_date: booking.scheduledDate,
    scheduled_time: booking.scheduledTime,
    bedrooms: booking.bedrooms,
    bathrooms: booking.bathrooms,
    extras: booking.extras || [],
    street_address: booking.streetAddress,
    suburb: booking.suburb,
    city: booking.city,
    cleaner_preference: normalizedPreference,
    assigned_cleaner_id: assignedCleanerId,
    team_id: teamId,
    special_instructions: booking.specialInstructions || null,
    fitted_rooms_count: booking.fittedRoomsCount ?? null,
    loose_carpets_count: booking.looseCarpetsCount ?? null,
    rooms_furniture_status: booking.roomsFurnitureStatus || null,
    office_size: booking.officeSize ?? null,
    contact_first_name: booking.firstName,
    contact_last_name: booking.lastName,
    contact_email: booking.email,
    contact_phone: booking.phone,
    total_amount: booking.totalAmount,
    subtotal: booking.subtotal ?? null,
    is_recurring: booking.isRecurring ?? false,
    status: booking.status,
    payment_status: booking.paymentStatus,
  };
}

async function applyV2Extension(
  state: BookFormState,
  bookingReference: string,
  userId?: string
) {
  const supabase = createServiceRoleClient();
  const extension = getBookV2ExtensionPayload(state);
  await supabase
    .from("bookings")
    .update({ ...extension, user_id: userId ?? null })
    .eq("booking_reference", bookingReference);
}

export async function saveBookV2Booking(
  state: BookFormState,
  userId?: string
): Promise<{ success: boolean; bookingReference?: string; message?: string }> {
  try {
    const supabase = createServiceRoleClient();
    const bookingReference = state.bookingReference ?? generateBookingReference();

    const { data: existing } = await supabase
      .from("bookings")
      .select("id, payment_status, created_at")
      .eq("booking_reference", bookingReference)
      .maybeSingle();

    if (existing?.payment_status === "completed") {
      return {
        success: false,
        message: "This booking has already been paid.",
      };
    }

    const booking = mapBookFormStateToBooking(
      state,
      bookingReference,
      existing
        ? { id: existing.id, createdAt: existing.created_at as string }
        : undefined
    );

    if (existing) {
      const { error: updateError } = await supabase
        .from("bookings")
        .update(bookingToUpdateRow(booking))
        .eq("booking_reference", bookingReference);

      if (updateError) {
        return { success: false, message: updateError.message };
      }
    } else {
      try {
        await saveBooking(booking);
      } catch (insertErr) {
        const message = insertErr instanceof Error ? insertErr.message : "";
        if (!message.includes("bookings_booking_reference_key")) {
          throw insertErr;
        }
        const { data: dup } = await supabase
          .from("bookings")
          .select("payment_status")
          .eq("booking_reference", bookingReference)
          .maybeSingle();
        if (dup?.payment_status === "completed") {
          return { success: false, message: "This booking has already been paid." };
        }
        const { error: retryUpdateError } = await supabase
          .from("bookings")
          .update(bookingToUpdateRow(booking))
          .eq("booking_reference", bookingReference);
        if (retryUpdateError) {
          return { success: false, message: retryUpdateError.message };
        }
      }
    }

    try {
      await applyV2Extension(state, bookingReference, userId);
    } catch (extensionError) {
      console.warn("V2 booking extension update skipped:", extensionError);
    }

    return { success: true, bookingReference };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to save booking",
    };
  }
}

export async function initializeBookPayment(
  amount: number,
  email: string
): Promise<{
  success: boolean;
  publicKey?: string;
  amount?: number;
  email?: string;
  reference?: string;
  message?: string;
}> {
  const publicKey = getPaystackPublicKey();
  if (!publicKey) {
    return { success: false, message: getPaystackConfigError() };
  }
  const reference = `bokkie-v2-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  return {
    success: true,
    publicKey,
    amount: Math.round(amount * 100),
    email,
    reference,
  };
}

export async function getCustomerProfileForBooking() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, first_name, last_name, email, phone")
    .eq("id", user.id)
    .single();

  const { data: customerProfile } = await supabase
    .from("customer_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const fullName =
    customerProfile?.full_name ??
    profile?.full_name ??
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");

  return {
    userId: user.id,
    fullName: fullName ?? "",
    email: customerProfile?.email ?? profile?.email ?? user.email ?? "",
    cellNumber: customerProfile?.cell_number ?? profile?.phone ?? "",
    whatsappNumber: customerProfile?.whatsapp_number ?? "",
  };
}

export async function bookSignupAndProfile(data: {
  fullName: string;
  cellNumber: string;
  email: string;
  password: string;
}) {
  const supabase = await createClient();
  const nameParts = data.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { first_name: firstName, last_name: lastName, full_name: data.fullName, phone: data.cellNumber },
    },
  });

  if (error) return { success: false, message: error.message };

  if (authData.user) {
    const admin = createServiceRoleClient();
    await admin.from("customer_profiles").upsert(
      {
        user_id: authData.user.id,
        full_name: data.fullName,
        email: data.email,
        cell_number: data.cellNumber,
      },
      { onConflict: "user_id" }
    );
  }

  return { success: true, userId: authData.user?.id };
}

export async function bookLogin(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, message: error.message };
  return { success: true, userId: data.user?.id };
}

export async function verifyAndCompleteBookPayment(
  bookingReference: string,
  paymentReference: string
): Promise<{ success: boolean; message?: string }> {
  const secretKey = getPaystackSecretKey();
  if (!secretKey) {
    return { success: false, message: getPaystackConfigError() };
  }

  const supabase = createServiceRoleClient();
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("total_amount, payment_status")
    .eq("booking_reference", bookingReference)
    .maybeSingle();

  if (fetchError || !booking) {
    return { success: false, message: "Booking not found" };
  }

  if (booking.payment_status === "completed") {
    return { success: true, message: "Payment already confirmed" };
  }

  const verified = await verifyPayment(paymentReference, secretKey);
  if (!verified) {
    await supabase
      .from("bookings")
      .update({
        payment_status: "failed",
        payment_reference: paymentReference,
        status: "pending",
      })
      .eq("booking_reference", bookingReference);

    return {
      success: false,
      message: "Payment could not be verified with Paystack. Please try again or contact support.",
    };
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      payment_status: "completed",
      payment_reference: paymentReference,
      status: "confirmed",
    })
    .eq("booking_reference", bookingReference);

  if (updateError) {
    return { success: false, message: updateError.message };
  }

  return { success: true, message: "Payment verified and booking confirmed" };
}

/** @deprecated Use verifyAndCompleteBookPayment — does not verify with Paystack */
export async function updateBookPaymentStatus(
  bookingReference: string,
  paymentReference: string,
  status: "completed" | "failed"
) {
  const supabase = createServiceRoleClient();
  await supabase
    .from("bookings")
    .update({
      payment_status: status,
      payment_reference: paymentReference,
      status: status === "completed" ? "confirmed" : "pending",
    })
    .eq("booking_reference", bookingReference);
}
