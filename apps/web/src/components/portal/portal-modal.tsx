"use client";

import { type ReactNode, useEffect } from "react";

type PortalModalProps = {
  children: ReactNode;
  description?: string;
  onClose: () => void;
  title: string;
};

export function PortalModal({ children, description, onClose, title }: PortalModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#10222f]/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="panel w-full max-w-2xl rounded-[1.6rem] p-6 sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Pairing Help</p>
            <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
            {description ? <p className="mt-3 text-sm text-muted">{description}</p> : null}
          </div>
          <button
            aria-label="Close pairing instructions"
            className="button-secondary !min-h-0 !rounded-[0.9rem] !px-4 !py-2"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
