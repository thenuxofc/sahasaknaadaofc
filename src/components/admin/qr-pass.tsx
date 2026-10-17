import { useEffect, useState, type ReactNode } from "react";
import * as QRCode from "qrcode";
import { QrCode, Download, Share2, Copy, Check, AlertTriangle } from "lucide-react";

import { EVENT } from "@/lib/content";
import type { Registration } from "@/lib/registration";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { fmtUtcLocal } from "./primitives";

/*
 * Quick QR entry pass for a CONFIRMED registration.
 * The QR encodes the public registration code (e.g. SSA-XXXXXX) so it can be
 * scanned at the door for verification. No participant data beyond the code is
 * embedded. Rendered only when status === "Confirmed".
 */
export function QrPass({ row }: { row: Registration }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Show QR entry pass for ${row.fullName}, code ${row.code}`}
        className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold transition-colors hover:border-gold/60 hover:bg-gold/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <QrCode className="h-3.5 w-3.5" aria-hidden /> Pass
      </button>
      <QrPassDialog row={row} open={open} onOpenChange={setOpen} />
    </>
  );
}

function QrPassDialog({
  row,
  open,
  onOpenChange,
}: {
  row: Registration;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setFailed(false);
    QRCode.toDataURL(row.code, {
      margin: 2,
      width: 512,
      errorCorrectionLevel: "M",
      color: { dark: "#0A0A0A", light: "#FFFFFF" },
    })
      .then((url: string) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [open, row.code]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  useEffect(() => {
    if (!shareCopied) return;
    const t = setTimeout(() => setShareCopied(false), 1800);
    return () => clearTimeout(t);
  }, [shareCopied]);

  function download() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `sahasaknaada-pass-${row.code}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function share() {
    const text = `${row.fullName} — ${row.code} · ${EVENT.name} entry pass`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${EVENT.name} entry pass`, text });
        return;
      } catch {
        /* user dismissed the share sheet */
      }
    }
    try {
      await navigator.clipboard?.writeText(text);
      setShareCopied(true);
    } catch {
      /* clipboard unavailable */
    }
  }

  function copyCode() {
    try {
      void navigator.clipboard?.writeText(row.code).then(() => setCopied(true));
    } catch {
      /* ignore */
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm overflow-hidden rounded-3xl border-hairline bg-surface p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="font-display text-xl tracking-tight">Entry pass</DialogTitle>
          <DialogDescription>
            Scan to verify a confirmed registration at the door.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 px-6 pb-7 pt-2">
          <div className="grid h-52 w-52 place-items-center rounded-2xl border border-hairline bg-white p-3">
            {failed ? (
              <p className="px-3 text-center text-xs text-black/70">
                Couldn&apos;t render the QR code. Show this code at the door:{" "}
                <strong className="font-semibold">{row.code}</strong>
              </p>
            ) : dataUrl ? (
              <img
                src={dataUrl}
                alt={`QR code encoding registration code ${row.code}`}
                width={200}
                height={200}
                className="h-full w-full"
              />
            ) : (
              <div className="h-full w-full animate-pulse rounded-lg bg-black/10" />
            )}
          </div>

          <div className="w-full text-center">
            <p className="font-display text-lg font-bold text-foreground">{row.fullName}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{row.school}</p>
            <p className="mt-3 inline-block rounded-lg border border-gold/40 bg-gold/10 px-4 py-1.5 font-mono text-base font-semibold tracking-[0.2em] text-gold">
              {row.code}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Confirmed · {fmtUtcLocal(row.createdAt)}
            </p>
          </div>

          <div className="grid w-full grid-cols-3 gap-2">
            <PassAction
              onClick={download}
              disabled={!dataUrl}
              icon={<Download className="h-4 w-4" />}
              label="Download"
            />
            <PassAction
              onClick={share}
              icon={shareCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              label={shareCopied ? "Copied" : "Share"}
            />
            <PassAction
              onClick={copyCode}
              icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              label={copied ? "Copied" : "Copy code"}
            />
          </div>

          {failed && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> QR unavailable — the code above
              still identifies this registration.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PassAction({
  onClick,
  icon,
  label,
  disabled,
}: {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-background px-2 py-3 text-xs font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
