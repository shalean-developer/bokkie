"use server";

import { sendContactEmail, sendContactConfirmationEmail } from "@/lib/email";

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface SubmitContactResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export async function submitContact(
  data: ContactFormData
): Promise<SubmitContactResult> {
  // Server-side validation
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = "Name is required";
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Valid email is required";
  }

  if (!data.subject || data.subject.trim().length === 0) {
    errors.subject = "Subject is required";
  }

  if (!data.message || data.message.trim().length === 0) {
    errors.message = "Message is required";
  }

  if (data.message && data.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please fix the errors in the form",
      errors,
    };
  }

  try {
    await Promise.all([sendContactEmail(data), sendContactConfirmationEmail(data)]);

    return {
      success: true,
      message: "Your message has been sent successfully! We've emailed you a confirmation and will get back to you soon.",
    };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack,
      error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    });
    
    // Return more specific error message to help with debugging
    return {
      success: false,
      message: errorMessage.includes("RESEND_API_KEY") 
        ? "Email service is not configured. Please contact support directly."
        : `An error occurred: ${errorMessage}`,
    };
  }
}
