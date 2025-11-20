import { clsx } from "clsx";
import { type ReactNode, useMemo } from "react";

export type TabItem = {
  value: string;
  label: string;
  icon?: ReactNode;
};

type TabsProps = {
  tabs: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
};

export function Tabs({ tabs, value, onValueChange }: TabsProps) {
  return (
    <div className="flex gap-2 rounded-[10px] border border-[--border] bg-[--card] p-1">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            onClick={() => onValueChange(tab.value)}
            className={clsx(
              "flex flex-1 items-center justify-center gap-1 rounded-[8px] px-3 py-2 text-sm font-medium transition-all",
              active
                ? "bg-[--muted] text-[--text]"
                : "text-[--subtle] hover:text-[--text]"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

type TabsContentProps = {
  value: string;
  activeValue: string;
  children: ReactNode;
};

export function TabsContent({ value, activeValue, children }: TabsContentProps) {
  const show = useMemo(() => value === activeValue, [value, activeValue]);
  if (!show) return null;
  return <div className="mt-4">{children}</div>;
}
