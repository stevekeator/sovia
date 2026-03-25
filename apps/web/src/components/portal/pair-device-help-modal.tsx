"use client";

import { useState } from "react";

import { PortalModal } from "@/components/portal/portal-modal";

type PairDeviceHelpModalProps = {
  hasPendingCode: boolean;
};

export function PairDeviceHelpModal({ hasPendingCode }: PairDeviceHelpModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" className="button-secondary" onClick={() => setIsOpen(true)}>
        How to Pair a Device
      </button>

      {isOpen ? (
        <PortalModal
          description="Use this short walkthrough when a caregiver is setting up a patient device for the first time."
          onClose={() => setIsOpen(false)}
          title="Pair a Mobile Device"
        >
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.95fr)]">
            <div className="space-y-4">
              {[
                "Open the patient mobile app on the phone or tablet you want to link.",
                hasPendingCode
                  ? "Use the current pairing code shown in the portal. If it expires, generate a new one."
                  : "Click Generate Code in the portal to create a short-lived pairing code.",
                "Enter the pairing code on the device during setup.",
                "Keep the device online until the routine library finishes downloading.",
                "Return to this page and confirm the device appears under Linked Devices.",
              ].map((step, index) => (
                <div key={step} className="flex items-start gap-3 rounded-[1.1rem] border border-line bg-[#f4f7fa] p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm leading-6 text-foreground">{step}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.15rem] border border-[#c7d7e2] bg-[#eef4f8] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#35596e]">
                  What the Patient Device Needs
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
                  <li>Mobile app open to the pairing screen</li>
                  <li>Internet access during initial linking</li>
                  <li>Enough time to download routines and images</li>
                </ul>
              </div>

              <div className="rounded-[1.15rem] border border-[#e3d2b0] bg-[#fbf4e6] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b6832]">
                  If Pairing Fails
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[#6b5b40]">
                  <li>Generate a fresh code and try again</li>
                  <li>Make sure the code is entered exactly as shown</li>
                  <li>Check that the device can reach the local server</li>
                </ul>
              </div>
            </div>
          </div>
        </PortalModal>
      ) : null}
    </>
  );
}
