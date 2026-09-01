"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SearchIcon,
  DownloadIcon,
  PencilIcon,
  TrashIcon,
  MoreVerticalIcon,
} from "lucide-react";
import { deleteQrCode } from "@/app/(dashboard)/actions";

type QrCodeData = {
  id: string;
  title: string;
  destinationUrl: string;
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Match the server's filename sanitization so the suggested download name agrees. */
function sanitizeFilename(title: string): string {
  const sanitized = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return sanitized || "qr-code";
}

/** A compact "3 days ago" style relative time, no dependency needed. */
function relativeTime(date: Date, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const diffMs = date.getTime() - Date.now();
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
  ];
  for (const [unit, ms] of units) {
    if (Math.abs(diffMs) >= ms) {
      return rtf.format(Math.round(diffMs / ms), unit);
    }
  }
  return rtf.format(0, "second");
}

export function QrList({ codes }: { codes: QrCodeData[] }) {
  const t = useTranslations("list");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<QrCodeData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredCodes = codes.filter((code) => {
    const query = search.toLowerCase();
    return (
      code.title.toLowerCase().includes(query) ||
      code.destinationUrl.toLowerCase().includes(query)
    );
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteQrCode(deleteTarget.id);
    setDeleting(false);

    if (result.ok) {
      toast.success(t("deletedToast", { title: deleteTarget.title }));
      setDeleteTarget(null);
    } else {
      toast.error(result.error ?? t("deleteFailed"));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredCodes.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            {search ? t("noMatch") : t("empty")}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCodes.map((code, index) => (
            <div
              key={code.id}
              style={{
                animationDuration: "500ms",
                animationDelay: `${Math.min(index, 8) * 70}ms`,
              }}
              className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both motion-reduce:animate-none"
            >
            <Card className="h-full overflow-hidden ease-out transition duration-200 hover:-translate-y-0.5 hover:ring-primary/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
              <CardContent className="flex gap-4 pt-4">
                <div
                  className="flex-shrink-0 rounded-lg p-2"
                  style={{ backgroundColor: code.backgroundColor }}
                >
                  <QRCodeSVG
                    value={code.destinationUrl}
                    size={80}
                    fgColor={code.foregroundColor}
                    bgColor={code.backgroundColor}
                    level="H"
                    imageSettings={
                      code.logoUrl
                        ? {
                            src: code.logoUrl,
                            height: 20,
                            width: 20,
                            excavate: true,
                          }
                        : undefined
                    }
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                  <h3 className="truncate font-medium text-foreground">
                    {code.title}
                  </h3>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {code.destinationUrl}
                  </p>
                  <p
                    className="mt-auto text-xs text-muted-foreground"
                    suppressHydrationWarning
                  >
                    {relativeTime(code.createdAt, locale)}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t("actionsLabel")}
                      />
                    }
                  >
                    <MoreVerticalIcon className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      render={
                        <a
                          href={`/api/qr/${code.id}?format=png`}
                          download={`${sanitizeFilename(code.title)}.png`}
                        />
                      }
                    >
                      <DownloadIcon />
                      {t("downloadPng")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      render={
                        <a
                          href={`/api/qr/${code.id}?format=svg`}
                          download={`${sanitizeFilename(code.title)}.svg`}
                        />
                      }
                    >
                      <DownloadIcon />
                      {t("downloadSvg")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href={`/dashboard/${code.id}/edit`} />}>
                      <PencilIcon />
                      {t("edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeleteTarget(code)}
                    >
                      <TrashIcon />
                      {t("delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t("deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("deleteDescription", { title: deleteTarget?.title ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {t("cancel")}
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? t("deleting") : t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
