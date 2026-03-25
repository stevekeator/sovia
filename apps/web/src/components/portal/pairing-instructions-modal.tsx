"use client";

import { useEffect, useState } from "react";

export function PairingInstructionsModal({
  supportedUserName,
}: {
  supportedUserName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <>
      <button type="button" className="button-secondary !py-3" onClick={() => setIsOpen(true)}>
        How to Pair a Device
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10222f]/45 px-4 py-8">
          <div className="w-full max-w-2xl rounded-[1.4rem] border border-line bg-white p-6 shadow-[0_28px_60px_rgba(16,34,47,0.24)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Device Pairing</p>
                <h3 className="mt-2 text-2xl font-semibold">How to Link {supportedUserName}&rsquo;s Device</h3>
              </div>
              <button
                type="button"
                className="button-secondary !py-3"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm leading-7 text-muted">
              <p>
                Pairing links this supported user to the patient device so routines, images, and audio prompts can sync down to the app.
              </p>
              <ol className="space-y-3 pl-5 text-foreground">
                <li>1. Open the mobile app on the device you want to link.</li>
                <li>2. Stay on the pairing screen in the app.</li>
                <li>3. In this portal, click <span className="font-semibold">Generate Code</span>.</li>
                <li>4. Enter the short-lived pairing code into the device before it expires.</li>
                <li>5. Wait for the app to confirm the link and finish downloading routines.</li>
              </ol>
              <div className="rounded-[1rem] border border-line bg-[#f7fafc] px-4 py-4">
                <p className="font-semibold text-foreground">After pairing</p>
                <p className="mt-1">
                  The linked device will keep showing here in the portal. If the wrong device is connected, revoke it and generate a fresh pairing code.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
