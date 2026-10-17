/*
 * TicketPass — the Sahasaknaada entry pass built on TearTicket.
 * The body shows the event identity + registration code; the tear-off
 * stub carries a QR encoding the registration code for door verification.
 */
import { useEffect, useState } from "react";
import * as QRCode from "qrcode";
import { QrCode, Ticket as TicketIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import TearTicket from "@/components/bits/tear-ticket";
import { EVENT } from "@/lib/content";

export function TicketPass({ code, name }: { code: string; name: string }) {
  const reduce = useReducedMotion();
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(code, {
      margin: 0,
      width: 240,
      errorCorrectionLevel: "M",
      color: { dark: "#0A0A0A", light: "#F5B921" },
    })
      .then((url: string) => {
        if (active) setQr(url);
      })
      .catch(() => {
        if (active) setQr(null);
      });
    return () => {
      active = false;
    };
  }, [code]);

  return (
    <motion.div
      className="flex w-full justify-center"
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: reduce ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <TearTicket
        width={520}
        height={280}
        stubSize={176}
        radius={20}
        holes={14}
        holeSize={6}
        notch={3}
        roughness={0}
        tearAngle={30}
        stretch={30}
        resistance={0.45}
        rotate={0}
        tilt
        tiltMax={7}
        tiltReach={280}
        parallax={6}
        perspective={1000}
        background="#0D0D0D"
        color="#F5F5F5"
        border
        borderColor="rgba(245,185,33,0.35)"
        borderWidth={1}
        stubBackground="#F5B921"
        recenter
        ariaLabel={`Tear off the QR entry pass for ${name}, code ${code}`}
        image=""
        imageAlt=""
        scrim={false}
        stub={
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#F5B921] px-3 py-4 text-[#0A0A0A]">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0A0A0A]/70">
              Scan at door
            </span>
            <div className="grid h-28 w-28 place-items-center rounded-lg bg-[#F5B921] p-1.5">
              {qr ? (
                <img
                  src={qr}
                  alt={`QR code encoding registration code ${code}`}
                  width={112}
                  height={112}
                  className="h-full w-full"
                />
              ) : (
                <div className="grid h-full w-full place-items-center rounded bg-[#0A0A0A]/10">
                  <QrCode className="h-9 w-9 text-[#0A0A0A]/50" aria-hidden />
                </div>
              )}
            </div>
            <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-[#0A0A0A]">
              {code}
            </span>
          </div>
        }
      >
        <div className="flex h-full flex-col justify-between px-7 py-6 text-[#F5F5F5]">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-gold">
            <TicketIcon className="h-3.5 w-3.5" aria-hidden />
            <span>{EVENT.tagline}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-[0.18em] text-[#A3A3A3]">
              Admit one
            </span>
            <span className="font-display text-2xl font-bold leading-tight tracking-tight">
              {EVENT.name}
            </span>
            <span className="mt-1 max-w-[260px] text-sm leading-snug text-[#A3A3A3]">
              {name.split(" ")[0] || "Participant"} · keep this pass for the workshop.
            </span>
          </div>
          <div className="flex items-end justify-between">
            <span className="font-mono text-[11px] tracking-[0.2em] text-[#A3A3A3]">No.</span>
            <span className="font-display text-2xl font-bold tracking-[0.16em] text-gold">
              {code}
            </span>
          </div>
        </div>
      </TearTicket>
    </motion.div>
  );
}
