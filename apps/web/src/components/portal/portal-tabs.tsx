import Link from "next/link";

type PortalTab = {
  href?: string;
  id: string;
  label: string;
};

export function PortalTabs({
  basePath,
  currentTab,
  tabs,
}: {
  basePath: string;
  currentTab: string;
  tabs: PortalTab[];
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-[1.2rem] border border-line bg-[#eef3f7] p-2">
      {tabs.map((tab) => {
        const isActive = tab.id === currentTab;

        return (
          <Link
            key={tab.id}
            href={tab.href ?? `${basePath}?tab=${tab.id}`}
            className={[
              "inline-flex items-center rounded-[0.9rem] px-4 py-2.5 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[#2d5fd1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eef3f7]",
              isActive
                ? "bg-[#183541] !text-white shadow-[0_10px_18px_rgba(15,32,44,0.14)] ring-1 ring-white/12"
                : "text-muted hover:bg-white hover:text-foreground",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
