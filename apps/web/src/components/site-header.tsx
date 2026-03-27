import { ProductWordmark } from "@/components/product-wordmark";
import { SiteNav } from "@/components/site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-[rgba(247,243,234,0.88)] backdrop-blur-md">
      <div className="page-shell py-4">
        <div className="flex items-center justify-between gap-5 rounded-[10px] border border-[rgba(217,215,207,0.86)] bg-[linear-gradient(180deg,rgba(252,251,248,0.96)_0%,rgba(249,246,239,0.88)_100%)] px-4 py-3 shadow-[0_10px_22px_rgba(31,42,40,0.05)]">
          <ProductWordmark />
          <SiteNav />
        </div>
      </div>
    </header>
  );
}
