import type { ReactNode } from "react";
import SeoServiceLinks from "@/components/marketing/SeoServiceLinks";

export default function AreasLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SeoServiceLinks title="Cleaning services available across Cape Town" />
      {children}
    </>
  );
}
