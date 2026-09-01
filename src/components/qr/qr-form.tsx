"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createQrCode, updateQrCode } from "@/app/(dashboard)/actions";
import { UploadIcon, XIcon } from "lucide-react";

type QrFormData = {
  id?: string;
  title: string;
  destinationUrl: string;
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  logoUrl: string | null;
  logoPath: string | null;
};

type QrFormProps = {
  mode: "create" | "edit";
  initialData?: QrFormData;
};

const DEFAULT_DATA: QrFormData = {
  title: "",
  destinationUrl: "",
  foregroundColor: "#000000",
  backgroundColor: "#FFFFFF",
  size: 512,
  logoUrl: null,
  logoPath: null,
};

export function QrForm({ mode, initialData }: QrFormProps) {
  const router = useRouter();
  const t = useTranslations("form");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialData?.title ?? DEFAULT_DATA.title);
  const [destinationUrl, setDestinationUrl] = useState(
    initialData?.destinationUrl ?? DEFAULT_DATA.destinationUrl
  );
  const [foregroundColor, setForegroundColor] = useState(
    initialData?.foregroundColor ?? DEFAULT_DATA.foregroundColor
  );
  const [backgroundColor, setBackgroundColor] = useState(
    initialData?.backgroundColor ?? DEFAULT_DATA.backgroundColor
  );
  const [size, setSize] = useState(initialData?.size ?? DEFAULT_DATA.size);
  const [logoUrl, setLogoUrl] = useState<string | null>(
    initialData?.logoUrl ?? null
  );
  const [logoPath, setLogoPath] = useState<string | null>(
    initialData?.logoPath ?? null
  );

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const previewUrl = destinationUrl || "https://example.com";

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message ?? t("toastLogoFailed"));
        setUploading(false);
        return;
      }

      const data = await response.json();
      setLogoUrl(data.url);
      setLogoPath(data.pathname);
      toast.success(t("toastLogoUploaded"));
    } catch {
      toast.error(t("toastLogoFailed"));
    }

    setUploading(false);
    // Clear the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleRemoveLogo() {
    setLogoUrl(null);
    setLogoPath(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const input = {
      title,
      destinationUrl,
      foregroundColor,
      backgroundColor,
      size,
      logoUrl,
      logoPath,
    };

    const result =
      mode === "create"
        ? await createQrCode(input)
        : await updateQrCode(initialData!.id!, input);

    setSubmitting(false);

    if (result.ok) {
      toast.success(mode === "create" ? t("toastCreated") : t("toastUpdated"));
      router.push("/dashboard");
    } else {
      toast.error(result.error ?? t("toastError"));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("details")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">{t("titleLabel")}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("titlePlaceholder")}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="destinationUrl">{t("destinationUrl")}</Label>
              <Input
                id="destinationUrl"
                type="url"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("appearance")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="foregroundColor">{t("foregroundColor")}</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="foregroundColor"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="h-8 w-12 cursor-pointer rounded-lg border border-input bg-transparent p-0.5"
                  />
                  <Input
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 font-mono"
                    maxLength={7}
                    aria-label={t("foregroundColor")}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="backgroundColor">{t("backgroundColor")}</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="backgroundColor"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-8 w-12 cursor-pointer rounded-lg border border-input bg-transparent p-0.5"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    placeholder="#FFFFFF"
                    className="flex-1 font-mono"
                    maxLength={7}
                    aria-label={t("backgroundColor")}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="size">{t("size")}</Label>
              <Select
                value={String(size)}
                onValueChange={(val) => setSize(Number(val))}
              >
                <SelectTrigger id="size" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="256">256 x 256 px</SelectItem>
                  <SelectItem value="512">512 x 512 px</SelectItem>
                  <SelectItem value="1024">1024 x 1024 px</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t("centerLogo")}</Label>
              {logoUrl ? (
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoUrl}
                      alt={t("centerLogo")}
                      width={48}
                      height={48}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveLogo}
                  >
                    <XIcon className="size-4" />
                    {t("remove")}
                  </Button>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <UploadIcon className="size-4" />
                    {uploading ? t("uploading") : t("uploadLogo")}
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">{t("logoHint")}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting
              ? mode === "create"
                ? t("creating")
                : t("saving")
              : mode === "create"
                ? t("create")
                : t("save")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            {t("cancel")}
          </Button>
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle>{t("preview")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: backgroundColor }}
            >
              <QRCodeSVG
                value={previewUrl}
                size={200}
                fgColor={foregroundColor}
                bgColor={backgroundColor}
                level="H"
                imageSettings={
                  logoUrl
                    ? {
                        src: logoUrl,
                        height: 50,
                        width: 50,
                        excavate: true,
                      }
                    : undefined
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
