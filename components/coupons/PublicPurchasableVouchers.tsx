"use client";

import { useState, useTransition, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PurchasableVoucher } from "@/app/actions/vouchers";
import { purchaseVoucher, completeVoucherPurchase } from "@/app/actions/vouchers";
import { initializePaystack } from "@/lib/paystack";
import { useUser } from "@/lib/hooks/useSupabase";
import {
  Gift,
  CreditCard,
  Percent,
  Tag,
  ShoppingCart,
  Loader2,
  CheckCircle,
  LogIn,
} from "lucide-react";

interface PublicPurchasableVouchersProps {
  vouchers: PurchasableVoucher[];
}

function formatValue(voucher: PurchasableVoucher) {
  if (voucher.voucher_type === "credit") {
    return `R${voucher.value.toFixed(2)}`;
  }
  if (voucher.voucher_type === "discount_percentage") {
    return `${voucher.value}%`;
  }
  return `R${voucher.value.toFixed(2)}`;
}

function getVoucherIcon(type: string) {
  switch (type) {
    case "credit":
      return CreditCard;
    case "discount_percentage":
      return Percent;
    case "discount_fixed":
      return Tag;
    default:
      return Gift;
  }
}

function getVoucherTypeLabel(type: string) {
  switch (type) {
    case "credit":
      return "Credit voucher";
    case "discount_percentage":
      return "Percentage discount";
    case "discount_fixed":
      return "Fixed discount";
    default:
      return "Voucher";
  }
}

function calculateSavings(voucher: PurchasableVoucher) {
  if (voucher.voucher_type === "credit") {
    const savings = voucher.value - voucher.purchase_price;
    if (savings > 0) return savings;
  }
  return null;
}

function PublicPurchasableVouchersContent({ vouchers }: PublicPurchasableVouchersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useUser();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const purchased = searchParams.get("purchased");
    const reference = searchParams.get("reference");

    if (purchased === "true" && reference) {
      const storedVoucherId = sessionStorage.getItem(`voucher_purchase_${reference}`);

      if (storedVoucherId) {
        startTransition(async () => {
          const result = await completeVoucherPurchase(storedVoucherId, reference);
          sessionStorage.removeItem(`voucher_purchase_${reference}`);

          if (result.success || result.message?.includes("already processed")) {
            setMessage({
              type: "success",
              text: "Voucher purchased successfully! View it in your dashboard.",
            });
          } else {
            setMessage({
              type: "error",
              text: result.message || "Payment received but voucher allocation failed. Please contact support.",
            });
          }

          router.replace("/coupons");
        });
      } else {
        setMessage({
          type: "success",
          text: "Payment successful! Your voucher should be available in your dashboard shortly.",
        });
        router.replace("/coupons");
      }
    }
  }, [searchParams, router]);

  const handlePurchase = (voucher: PurchasableVoucher) => {
    setPurchasingId(voucher.id);
    setMessage(null);

    startTransition(async () => {
      const result = await purchaseVoucher(voucher.id);

      if (!result.success) {
        setMessage({
          type: "error",
          text: result.message || "Failed to initialize payment",
        });
        setPurchasingId(null);
        return;
      }

      if (!result.publicKey || !result.amount || !result.email || !result.reference) {
        setMessage({
          type: "error",
          text: "Payment initialization failed. Please try again.",
        });
        setPurchasingId(null);
        return;
      }

      sessionStorage.setItem(`voucher_purchase_${result.reference}`, voucher.id);

      initializePaystack({
        publicKey: result.publicKey,
        amount: result.amount,
        email: result.email,
        reference: result.reference,
        currency: "ZAR",
        metadata: {
          type: "voucher_purchase",
          voucher_id: voucher.id,
        },
        callback_url: `${window.location.origin}/coupons?purchased=true&reference=${result.reference}`,
        onClose: () => {
          sessionStorage.removeItem(`voucher_purchase_${result.reference}`);
          setPurchasingId(null);
          setMessage({ type: "error", text: "Payment was cancelled" });
        },
      });
    });
  };

  if (vouchers.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
        <Gift className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No purchasable vouchers available right now. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" && <CheckCircle className="h-5 w-5 shrink-0" />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vouchers.map((voucher) => {
          const Icon = getVoucherIcon(voucher.voucher_type);
          const savings = calculateSavings(voucher);
          const isPurchasing = isPending && purchasingId === voucher.id;

          return (
            <div
              key={voucher.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-brand-primary/30 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-brand-primary/10">
                  <Icon className="h-6 w-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{voucher.title}</h3>
                  <p className="text-sm text-gray-500">{getVoucherTypeLabel(voucher.voucher_type)}</p>
                </div>
              </div>

              {voucher.description && (
                <p className="text-gray-600 text-sm mb-4">{voucher.description}</p>
              )}

              <div className="mb-4">
                <p className="text-2xl font-bold text-gray-900">{formatValue(voucher)}</p>
                {savings && (
                  <p className="text-xs text-emerald-600 mt-1 font-medium">
                    Save R{savings.toFixed(2)}!
                  </p>
                )}
                {voucher.voucher_type !== "credit" && voucher.minimum_order_amount > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Min. order: R{voucher.minimum_order_amount.toFixed(2)}
                  </p>
                )}
              </div>

              {voucher.valid_until && (
                <p className="text-xs text-gray-500 mb-4">
                  Valid until: {new Date(voucher.valid_until).toLocaleDateString()}
                </p>
              )}

              <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Purchase price</p>
                <p className="text-xl font-bold text-brand-primary">
                  R{voucher.purchase_price.toFixed(2)}
                </p>
              </div>

              {!userLoading && !user ? (
                <Link
                  href="/auth/login?redirect=/coupons"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-semibold bg-brand-primary text-white hover:bg-brand-primary-dark transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in to purchase
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => handlePurchase(voucher)}
                  disabled={isPurchasing || userLoading}
                  className={`w-full px-4 py-2.5 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                    isPurchasing || userLoading
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-brand-primary text-white hover:bg-brand-primary-dark"
                  }`}
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Purchase now
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PublicPurchasableVouchers(props: PublicPurchasableVouchersProps) {
  return (
    <Suspense fallback={<div className="text-gray-500 text-sm">Loading vouchers...</div>}>
      <PublicPurchasableVouchersContent {...props} />
    </Suspense>
  );
}
