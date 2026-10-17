/*
 * TicketPass — the Sahasaknaada entry pass.
 * Shows a working, scannable QR encoding the registration code,
 * the pass code, and a "Download as PNG" action.
 */
import { useEffect, useState } from "react";
import * as QRCode from "qrcode";
import { Download, QrCode, Ticket as TicketIcon } from "lucide-react";

import { EVENT } from "@/lib/content";

export function TicketPass({ code, name }: { code: string; name: string }) {
  const [qr, setQr] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Generate a high-contrast, scannable QR (dark modules on light ground).
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(code, {
      margin: 1,
      width: 480,
      errorCorrectionLevel: "M",
      color: { dark: "#0A0A0A", light: "#FFFFFF" },
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

  // Render the full pass (QR + code + event identity) onto a canvas for PNG export.
  const renderPassCanvas = async (): Promise<HTMLCanvasElement | null> => {
    const W = 820;
    const H = 460;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Background — near-black surface
    ctx.fillStyle = "#0D0D0D";
    ctx.fillRect(0, 0, W, H);

    // Gold accent bar on the left
    ctx.fillStyle = "#F5B921";
    ctx.fillRect(0, 0, 14, H);

    // Eyebrow
    ctx.fillStyle = "#F5B921";
    ctx.font = "600 16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.textBaseline = "top";
    ctx.fillText("ADMIT ONE · ENTRY PASS", 48, 44);

    // Event name
    ctx.fillStyle = "#F5F5F5";
    ctx.font = "700 44px 'Space Grotesk', system-ui, sans-serif";
    ctx.fillText(EVENT.name.toUpperCase(), 48, 76);

    // Participant
    ctx.fillStyle = "#A3A3A3";
    ctx.font = "500 18px 'Manrope', system-ui, sans-serif";
    ctx.fillText(`Participant: ${name}`, 48, 140);

    // Pass code label + value
    ctx.fillStyle = "#A3A3A3";
    ctx.font = "600 13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText("PASS CODE", 48, 188);
    ctx.fillStyle = "#F5B921";
    ctx.font = "700 40px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText(code, 48, 212);

    // QR on the right
    const qrSize = 300;
    const qrX = W - qrSize - 48;
    const qrY = 80;
    // White plate behind QR for scannability
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24);
    if (qr) {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("qr load failed"));
        img.src = qr;
      });
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
    } else {
      ctx.fillStyle = "#0A0A0A";
      ctx.fillRect(qrX, qrY, qrSize, qrSize);
    }

    // Footer line
    ctx.fillStyle = "#A3A3A3";
    ctx.font = "500 14px 'Manrope', system-ui, sans-serif";
    ctx.fillText("Scan this QR at the door · Radio Club of D. S. Senanayake College", 48, H - 40);

    return canvas;
  };

  const downloadPng = async () => {
    if (downloading) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const canvas = await renderPassCanvas();
      if (!canvas) throw new Error("canvas");
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `sahasaknaada-pass-${code}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      setDownloadError("Could not generate the PNG. Please take a screenshot instead.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-surface shadow-[0_24px_70px_-20px_rgba(0,0,0,0.8)]">
        {/* Gold accent edge */}
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gold" aria-hidden />

        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-stretch sm:p-8">
          {/* Left: identity + code */}
          <div className="flex flex-1 flex-col justify-between gap-4 sm:pl-3">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                <TicketIcon className="h-3.5 w-3.5" aria-hidden />
                <span>Admit one · Entry pass</span>
              </div>
              <h3 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl">
                {EVENT.name}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Participant: <span className="text-foreground">{name}</span>
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Pass Code
              </span>
              <p className="mt-1 font-mono text-3xl font-bold tracking-wider text-gold sm:text-4xl">
                {code}
              </p>
            </div>
          </div>

          {/* Right: QR */}
          <div className="flex shrink-0 flex-col items-center gap-3">
            <div className="rounded-2xl bg-white p-3 shadow-[0_8px_30px_-12px_rgba(245,185,33,0.35)]">
              {qr ? (
                <img
                  src={qr}
                  alt={`QR code encoding registration pass code ${code}`}
                  width={220}
                  height={220}
                  className="h-[220px] w-[220px]"
                />
              ) : (
                <div className="grid h-[220px] w-[220px] place-items-center rounded bg-neutral-200">
                  <QrCode className="h-12 w-12 text-neutral-500" aria-hidden />
                </div>
              )}
            </div>
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Scan at door
            </span>
          </div>
        </div>

        {/* Footer: download */}
        <div className="flex flex-col items-center gap-2 border-t border-hairline bg-background/60 px-6 py-4 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Save your pass or scan the QR at the workshop entrance.
          </p>
          <button
            type="button"
            onClick={downloadPng}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold px-5 py-2.5 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-gold-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
          >
            <Download className="h-4 w-4" aria-hidden />
            {downloading ? "Generating…" : "Download as PNG"}
          </button>
        </div>
      </div>

      {downloadError && (
        <p role="alert" className="mt-3 text-center text-xs font-medium text-destructive">
          {downloadError}
        </p>
      )}
    </div>
  );
}
