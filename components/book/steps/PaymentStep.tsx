"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBookForm } from "../BookFormProvider";
import { PriceSummaryCard } from "../PriceSummaryCard";
import { getServiceConfig, usesTeamSelection } from "@/lib/book/services";
import { formatCurrency } from "@/lib/book/pricing";
import { clearBookState } from "@/lib/book/storage";
import { loginSchema, signupSchema } from "@/lib/book/schemas";
import {
  getCustomerProfileForBooking,
  bookLogin,
  bookSignupAndProfile,
  saveBookV2Booking,
  verifyAndCompleteBookPayment,
  initializeBookPayment,
} from "@/app/actions/book-v2";
import { initializePaystack } from "@/lib/paystack";
import { useAuth } from "@/lib/hooks/useSupabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CreditCard,
  User,
  CheckCircle2,
  MessageCircle,
  Home,
  ExternalLink,
  Shield,
} from "lucide-react";
import { DEFAULT_TEAMS } from "@/lib/book/constants";

export function PaymentStep() {
  const { state, setCustomer, updateState, isHydrated } = useBookForm();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const config = getServiceConfig(state.service);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupData, setSignupData] = useState({
    fullName: "",
    cellNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [authError, setAuthError] = useState("");
  const [authLoading2, setAuthLoading2] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  const isAuthenticated = !!user;
  const isTeam = usesTeamSelection(state.service);
  const teamName = DEFAULT_TEAMS.find((t) => t.id === state.schedule.assignedTeamId)?.teamName;
  const pricing = state.pricingSummary;

  useEffect(() => {
    if (user && !state.customer.email) {
      getCustomerProfileForBooking().then((profile) => {
        if (profile) {
          setCustomer({
            fullName: profile.fullName,
            email: profile.email,
            cellNumber: profile.cellNumber,
            whatsappNumber: profile.whatsappNumber,
          });
          updateState({ userId: profile.userId });
        }
      });
    }
  }, [user, state.customer.email, setCustomer, updateState]);

  const handleLogin = async () => {
    setAuthError("");
    const parsed = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!parsed.success) {
      setAuthError(parsed.error.issues[0]?.message ?? "Invalid login");
      return;
    }
    setAuthLoading2(true);
    const result = await bookLogin(loginEmail, loginPassword);
    setAuthLoading2(false);
    if (!result.success) {
      setAuthError(result.message ?? "Login failed");
      return;
    }
    const profile = await getCustomerProfileForBooking();
    if (profile) {
      setCustomer({
        fullName: profile.fullName,
        email: profile.email,
        cellNumber: profile.cellNumber,
      });
      updateState({ userId: profile.userId });
    }
  };

  const handleSignup = async () => {
    setAuthError("");
    const parsed = signupSchema.safeParse(signupData);
    if (!parsed.success) {
      setAuthError(parsed.error.issues[0]?.message ?? "Invalid signup");
      return;
    }
    setAuthLoading2(true);
    const result = await bookSignupAndProfile({
      fullName: signupData.fullName,
      cellNumber: signupData.cellNumber,
      email: signupData.email,
      password: signupData.password,
    });
    setAuthLoading2(false);
    if (!result.success) {
      setAuthError(result.message ?? "Signup failed");
      return;
    }
    setCustomer({
      fullName: signupData.fullName,
      email: signupData.email,
      cellNumber: signupData.cellNumber,
    });
    updateState({ userId: result.userId });
  };

  const handlePay = async () => {
    if (!isAuthenticated && !user) {
      setAuthError("Please log in or create an account before payment");
      return;
    }
    if (!pricing) return;

    setAuthError("");
    setPaymentLoading(true);

    const saveResult = await saveBookV2Booking(
      { ...state, status: "pending_payment", customer: state.customer },
      state.userId ?? user?.id
    );

    if (!saveResult.success || !saveResult.bookingReference) {
      setAuthError(saveResult.message ?? "Failed to save booking");
      setPaymentLoading(false);
      return;
    }

    setBookingRef(saveResult.bookingReference);
    updateState({ bookingReference: saveResult.bookingReference });

    const payInit = await initializeBookPayment(pricing.estimatedTotal, state.customer.email);
    if (!payInit.success || !payInit.publicKey) {
      setAuthError(payInit.message ?? "Payment initialization failed");
      setPaymentLoading(false);
      return;
    }

    initializePaystack({
      publicKey: payInit.publicKey,
      email: state.customer.email,
      amount: payInit.amount!,
      reference: payInit.reference!,
      metadata: {
        booking_reference: saveResult.bookingReference,
        form_version: "v2",
      },
      onSuccess: async (reference) => {
        const verifyResult = await verifyAndCompleteBookPayment(
          saveResult.bookingReference!,
          reference
        );
        if (!verifyResult.success) {
          setAuthError(verifyResult.message ?? "Payment verification failed");
          setPaymentLoading(false);
          return;
        }
        setConfirmed(true);
        clearBookState();
        setPaymentLoading(false);
      },
      onClose: () => {
        setAuthError(
          "Payment window closed. If you completed payment, please wait a moment or contact support with your booking reference."
        );
        setPaymentLoading(false);
      },
    });

    // Paystack opens in a popup — stop button spinner once it launches
    setTimeout(() => setPaymentLoading(false), 500);
  };

  if (confirmed && bookingRef) {
    return (
      <Card className="max-w-2xl mx-auto text-center">
        <CardContent className="pt-10 pb-10 space-y-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-brand-primary">Booking confirmed!</h2>
            <p className="text-gray-500 mt-2">Thank you for booking with Bokkie Cleaning Services.</p>
          </div>
          <Badge variant="success" className="text-base px-4 py-1">
            Reference: {bookingRef}
          </Badge>
          <div className="text-sm text-gray-600 space-y-1">
            <p>{config.title} · {state.schedule.serviceDate} at {state.schedule.serviceTime}</p>
            <p>{isTeam ? `Team: ${teamName}` : `${state.schedule.cleanerCount} cleaner(s)`}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button asChild><Link href="/"><Home className="w-4 h-4" /> Back to Home</Link></Button>
            <Button variant="outline" asChild><Link href={`/dashboard/bookings`}><ExternalLink className="w-4 h-4" /> View Booking</Link></Button>
            <Button variant="secondary" asChild>
              <a href="https://wa.me/27210000000" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4" /> WhatsApp Shalean
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {!authLoading && !isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-brand-accent" />
                Account required
              </CardTitle>
              <CardDescription>
                Log in or create an account to complete your booking. Your form progress is saved.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
              <Tabs defaultValue="login">
                <TabsList>
                  <TabsTrigger value="login">Log in</TabsTrigger>
                  <TabsTrigger value="signup">Sign up</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="space-y-4">
                  <div><Label>Email</Label><Input className="mt-1.5" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} /></div>
                  <div><Label>Password</Label><Input type="password" className="mt-1.5" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} /></div>
                  <Button onClick={handleLogin} disabled={authLoading2} className="w-full">
                    Login and Continue to Payment
                  </Button>
                </TabsContent>
                <TabsContent value="signup" className="space-y-4">
                  <div><Label>Full name</Label><Input className="mt-1.5" value={signupData.fullName} onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })} /></div>
                  <div><Label>Cell number</Label><Input className="mt-1.5" value={signupData.cellNumber} onChange={(e) => setSignupData({ ...signupData, cellNumber: e.target.value })} /></div>
                  <div><Label>Email</Label><Input type="email" className="mt-1.5" value={signupData.email} onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} /></div>
                  <div><Label>Password</Label><Input type="password" className="mt-1.5" value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} /></div>
                  <div><Label>Confirm password</Label><Input type="password" className="mt-1.5" value={signupData.confirmPassword} onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })} /></div>
                  <Button onClick={handleSignup} disabled={authLoading2} className="w-full">
                    Create Account & Continue
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle>Your details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Full name</Label><Input className="mt-1.5" value={state.customer.fullName} onChange={(e) => setCustomer({ fullName: e.target.value })} /></div>
                <div><Label>Cell number</Label><Input className="mt-1.5" value={state.customer.cellNumber} onChange={(e) => setCustomer({ cellNumber: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" className="mt-1.5" value={state.customer.email} onChange={(e) => setCustomer({ email: e.target.value })} /></div>
                <div><Label>WhatsApp (optional)</Label><Input className="mt-1.5" value={state.customer.whatsappNumber ?? ""} onChange={(e) => setCustomer({ whatsappNumber: e.target.value })} /></div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-accent" />
              Payment
            </CardTitle>
            <CardDescription>Paystack-ready secure payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pricing && (
              <div className="rounded-xl bg-brand-surface p-4 flex justify-between items-center">
                <span className="font-medium text-brand-primary">Estimated total</span>
                <span className="text-2xl font-bold text-brand-primary">{formatCurrency(pricing.estimatedTotal)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield className="w-3.5 h-3.5" />
              Secured by Paystack · Status: pending until paid
            </div>
            {authError && isAuthenticated && (
              <Alert variant="destructive"><AlertDescription>{authError}</AlertDescription></Alert>
            )}
            <Button
              size="lg"
              className="w-full"
              disabled={!isAuthenticated || paymentLoading}
              onClick={() => handlePay()}
            >
              {paymentLoading ? "Processing..." : "Pay Now"}
            </Button>
            {!isAuthenticated && (
              <Alert>
                <AlertTitle>Authentication required</AlertTitle>
                <AlertDescription>Please log in or sign up above to proceed with payment.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Button variant="outline" onClick={() => router.push(`/book/${state.service}/review`)}>
          <ArrowLeft className="w-4 h-4" /> Back to Review
        </Button>
      </div>
      <div className="hidden lg:block">
        <PriceSummaryCard pricing={pricing} serviceTitle={config.title} showTrustBadges isHydrated={isHydrated} />
      </div>
    </div>
  );
}
