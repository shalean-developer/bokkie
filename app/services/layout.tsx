import type { ReactNode } from "react";
import SeoServiceLinks from "@/components/marketing/SeoServiceLinks";

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SeoServiceLinks title="Popular Cape Town cleaning services" />
      {children}
    </>
  );
}
