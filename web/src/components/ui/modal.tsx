import { createPortal } from "react-dom";
import { type ReactNode, useEffect, useState } from "react";
import { clsx } from "clsx";
import { Button } from "./button";

type ModalProps = {
  open: boolean;
  title?: string;
  onClose?: () => void;
  children: ReactNode;
};

export function Modal({ open, title, onClose, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!open || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "modal-card relative rounded-[14px] border border-[--border] bg-[--card] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.35)]"
        )}
        style={{ width: "min(720px, 90vw)", maxHeight: "80vh", overflowY: "auto" }}
      >
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            style={{ position: "absolute", top: 12, right: 12 }}
            aria-label="Close"
          >
            ✕
          </Button>
        )}
        {title && (
          <div className="mb-3 text-lg font-semibold" style={{ paddingRight: "28px", lineHeight: 1.25 }}>
            {title}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
