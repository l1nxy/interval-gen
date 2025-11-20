import { clsx } from "clsx";
import { type HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full bg-[--muted] px-2 py-1 text-xs font-medium text-[--text]",
        className
      )}
      {...props}
    />
  );
}
