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
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ColorField } from "@/components/qr/color-field";
import { FramedQr } from "@/components/qr/framed-qr";
import { createQrCode, updateQrCode } from "@/app/(dashboard)/actions";
import {
  buildQrContent,
  buildReadableContent,
  resolveQrType,
  resolveWifiEncryption,
  type QrType,
} from "@/lib/qr-content";
import {
  resolveCaptionPosition,
  resolveFrameStyle,
  type CaptionPosition,
  type FrameStyle,
} from "@/lib/qr-frame";
import { UploadIcon, XIcon, EyeIcon, EyeOffIcon } from "lucide-react";

type QrFormData = {
  id?: string;
  title: string;
  type: QrType;
  destinationUrl: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  org: string | null;
  ssid: string | null;
  wifiPassword: string | null;
  wifiEncryption: string | null;
  wifiHidden: boolean | null;
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  logoUrl: string | null;
  logoPath: string | null;
  frameEnabled: boolean;
  frameStyle: FrameStyle;
  frameCaption: string;
  frameCaptionPosition: CaptionPosition;
  frameColor: string;
};

type QrFormProps = {
  mode: "create" | "edit";
  initialData?: QrFormData;
};

const DEFAULT_DATA: QrFormData = {
  title: "",
  type: "link",
  destinationUrl: "",
  phone: null,
  firstName: null,
  lastName: null,
  email: null,
  org: null,
  ssid: null,
  wifiPassword: null,
  wifiEncryption: "WPA",
  wifiHidden: false,
  foregroundColor: "#000000",
  backgroundColor: "#FFFFFF",
  size: 512,
  logoUrl: null,
  logoPath: null,
  frameEnabled: false,
  frameStyle: "border",
  frameCaption: "",
  frameCaptionPosition: "bottom",
  frameColor: "#5B5FE9",
};

export function QrForm({ mode, initialData }: QrFormProps) {
  const router = useRouter();
  const t = useTranslations("form");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialData?.title ?? DEFAULT_DATA.title);
  const [type, setType] = useState<QrType>(initialData?.type ?? DEFAULT_DATA.type);
  const [destinationUrl, setDestinationUrl] = useState(
    initialData?.destinationUrl ?? DEFAULT_DATA.destinationUrl
  );
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [firstName, setFirstName] = useState(initialData?.firstName ?? "");
  const [lastName, setLastName] = useState(initialData?.lastName ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [org, setOrg] = useState(initialData?.org ?? "");
  const [ssid, setSsid] = useState(initialData?.ssid ?? "");
  const [wifiPassword, setWifiPassword] = useState(
    initialData?.wifiPassword ?? ""
  );
  const [wifiEncryption, setWifiEncryption] = useState(
    resolveWifiEncryption(initialData?.wifiEncryption ?? DEFAULT_DATA.wifiEncryption)
  );
  const [wifiHidden, setWifiHidden] = useState(
    initialData?.wifiHidden ?? DEFAULT_DATA.wifiHidden ?? false
  );
  const [showPassword, setShowPassword] = useState(false);
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
  const [frameEnabled, setFrameEnabled] = useState(
    initialData?.frameEnabled ?? DEFAULT_DATA.frameEnabled
  );
  const [frameStyle, setFrameStyle] = useState<FrameStyle>(
    initialData?.frameStyle ?? DEFAULT_DATA.frameStyle
  );
  // New codes start with the translated default caption ("Scan me" / "Skan et").
  const [frameCaption, setFrameCaption] = useState(
    initialData?.frameCaption ?? t("frameCaptionDefault")
  );
  const [frameCaptionPosition, setFrameCaptionPosition] =
    useState<CaptionPosition>(
      initialData?.frameCaptionPosition ?? DEFAULT_DATA.frameCaptionPosition
    );
  const [frameColor, setFrameColor] = useState(
    initialData?.frameColor ?? DEFAULT_DATA.frameColor
  );

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // The QR string and the readable tooltip text are both derived from this one
  // set of fields, so they can never fall out of sync.
  const contentFields = {
    type,
    destinationUrl,
    phone,
    firstName,
    lastName,
    email,
    org,
    ssid,
    wifiPassword,
    wifiEncryption,
    wifiHidden,
  };
  const qrContent = buildQrContent(contentFields);
  const readable = buildReadableContent(contentFields, {
    call: t("tooltipCall"),
    saveContact: t("tooltipSaveContact"),
    wifi: t("tooltipWifi"),
  });
  // Fall back to a sample so the preview still renders a code before any input.
  const previewValue = qrContent || "https://example.com";
  const tooltipText = readable || t("tooltipEmpty");

  // The frame settings the preview and (via the saved fields) the export share.
  const frameOptions = {
    style: frameStyle,
    caption: frameCaption,
    position: frameCaptionPosition,
    color: frameColor,
  };

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
      type,
      destinationUrl,
      phone,
      firstName,
      lastName,
      email,
      org,
      ssid,
      wifiPassword,
      wifiEncryption,
      wifiHidden,
      foregroundColor,
      backgroundColor,
      size,
      logoUrl,
      logoPath,
      frameEnabled,
      frameStyle,
      frameCaption,
      frameCaptionPosition,
      frameColor,
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
              <Label htmlFor="type">{t("contentType")}</Label>
              <Select
                value={type}
                onValueChange={(val) => setType(resolveQrType(val))}
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">{t("typeLink")}</SelectItem>
                  <SelectItem value="phone">{t("typePhone")}</SelectItem>
                  <SelectItem value="contact">{t("typeContact")}</SelectItem>
                  <SelectItem value="wifi">{t("typeWifi")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === "link" && (
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
            )}

            {type === "phone" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">{t("phoneLabel")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("phonePlaceholder")}
                  required
                />
              </div>
            )}

            {type === "contact" && (
              <div className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="firstName">{t("firstName")}</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={t("firstNamePlaceholder")}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="lastName">{t("lastName")}</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={t("lastNamePlaceholder")}
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">{t("phoneLabel")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("phonePlaceholder")}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">{t("emailLabel")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("emailPlaceholder")}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="org">{t("orgLabel")}</Label>
                  <Input
                    id="org"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    placeholder={t("orgPlaceholder")}
                  />
                </div>
              </div>
            )}

            {type === "wifi" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="ssid">{t("wifiSsid")}</Label>
                  <Input
                    id="ssid"
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                    placeholder={t("wifiSsidPlaceholder")}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="wifiEncryption">{t("wifiEncryption")}</Label>
                  <Select
                    value={wifiEncryption}
                    onValueChange={(val) =>
                      setWifiEncryption(resolveWifiEncryption(val))
                    }
                  >
                    <SelectTrigger id="wifiEncryption" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WPA">{t("wifiEncWpa")}</SelectItem>
                      <SelectItem value="WEP">{t("wifiEncWep")}</SelectItem>
                      <SelectItem value="nopass">{t("wifiEncNone")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Open networks (nopass) take no password. */}
                {wifiEncryption !== "nopass" && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="wifiPassword">{t("wifiPassword")}</Label>
                    <div className="relative">
                      <Input
                        id="wifiPassword"
                        type={showPassword ? "text" : "password"}
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        placeholder={t("wifiPasswordPlaceholder")}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                          showPassword
                            ? t("wifiHidePassword")
                            : t("wifiShowPassword")
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {showPassword ? (
                          <EyeOffIcon className="size-4" />
                        ) : (
                          <EyeIcon className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="wifiHidden">{t("wifiHidden")}</Label>
                  <Switch
                    id="wifiHidden"
                    checked={wifiHidden}
                    onCheckedChange={setWifiHidden}
                    aria-label={t("wifiHidden")}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("appearance")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                id="foregroundColor"
                label={t("foregroundColor")}
                value={foregroundColor}
                onChange={setForegroundColor}
                placeholder="#000000"
              />
              <ColorField
                id="backgroundColor"
                label={t("backgroundColor")}
                value={backgroundColor}
                onChange={setBackgroundColor}
                placeholder="#FFFFFF"
              />
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>{t("frame")}</CardTitle>
              <Switch
                checked={frameEnabled}
                onCheckedChange={setFrameEnabled}
                aria-label={t("frameEnable")}
              />
            </div>
          </CardHeader>
          {frameEnabled && (
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="frameStyle">{t("frameStyle")}</Label>
                <Select
                  value={frameStyle}
                  onValueChange={(val) => setFrameStyle(resolveFrameStyle(val))}
                >
                  <SelectTrigger id="frameStyle" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="border">{t("frameStyleBorder")}</SelectItem>
                    <SelectItem value="card">{t("frameStyleCard")}</SelectItem>
                    <SelectItem value="banner">{t("frameStyleBanner")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="frameCaption">{t("frameCaption")}</Label>
                <Input
                  id="frameCaption"
                  value={frameCaption}
                  onChange={(e) => setFrameCaption(e.target.value)}
                  placeholder={t("frameCaptionDefault")}
                  maxLength={60}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="frameCaptionPosition">
                    {t("frameCaptionPosition")}
                  </Label>
                  <Select
                    value={frameCaptionPosition}
                    onValueChange={(val) =>
                      setFrameCaptionPosition(resolveCaptionPosition(val))
                    }
                  >
                    <SelectTrigger id="frameCaptionPosition" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">{t("framePositionTop")}</SelectItem>
                      <SelectItem value="bottom">
                        {t("framePositionBottom")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ColorField
                  id="frameColor"
                  label={t("frameColor")}
                  value={frameColor}
                  onChange={setFrameColor}
                  placeholder="#5B5FE9"
                />
              </div>
            </CardContent>
          )}
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
            <TooltipProvider>
              <Tooltip>
                {/* The QR sits inside the tooltip trigger: hover or keyboard
                    focus reveals the readable version of the same data. On
                    touch devices, where hover doesn't exist, the code simply
                    renders without a tooltip. */}
                <TooltipTrigger
                  render={
                    <div
                      tabIndex={0}
                      role="img"
                      aria-label={tooltipText}
                      className="rounded-lg p-4 outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                      // With a frame on, the frame supplies the backdrop; without
                      // one the QR sits on its own background colour, as before.
                      style={
                        frameEnabled ? undefined : { backgroundColor: backgroundColor }
                      }
                    />
                  }
                >
                  {frameEnabled ? (
                    <FramedQr size={200} frame={frameOptions}>
                      <QRCodeSVG
                        value={previewValue}
                        size={200}
                        fgColor={foregroundColor}
                        bgColor={backgroundColor}
                        level="H"
                        imageSettings={
                          logoUrl
                            ? { src: logoUrl, height: 50, width: 50, excavate: true }
                            : undefined
                        }
                      />
                    </FramedQr>
                  ) : (
                    <QRCodeSVG
                      value={previewValue}
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
                  )}
                </TooltipTrigger>
                <TooltipContent>{tooltipText}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
