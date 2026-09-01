"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface SettingsTabsProps {
  initialUser: {
    name: string;
    email: string;
    emailVerified: boolean;
  };
}

interface Session {
  token: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: Date;
  current?: boolean;
}

export function SettingsTabs({ initialUser }: SettingsTabsProps) {
  const t = useTranslations("settings");
  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">{t("tabProfile")}</TabsTrigger>
        <TabsTrigger value="account">{t("tabAccount")}</TabsTrigger>
        <TabsTrigger value="security">{t("tabSecurity")}</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-6">
        <ProfileSection initialName={initialUser.name} />
      </TabsContent>

      <TabsContent value="account" className="mt-6">
        <AccountSection
          email={initialUser.email}
          emailVerified={initialUser.emailVerified}
        />
      </TabsContent>

      <TabsContent value="security" className="mt-6">
        <SecuritySection />
      </TabsContent>
    </Tabs>
  );
}

// ============================================================================
// Profile Section
// ============================================================================

function ProfileSection({ initialName }: { initialName: string }) {
  const router = useRouter();
  const t = useTranslations("settings");
  const [name, setName] = useState(initialName);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error(t("nameEmpty"));
      return;
    }

    setPending(true);
    const { error } = await authClient.updateUser({ name: trimmedName });
    setPending(false);

    if (error) {
      toast.error(error.message ?? t("nameUpdateFailed"));
      return;
    }

    toast.success(t("nameUpdated"));
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profileTitle")}</CardTitle>
        <CardDescription>{t("profileDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">{t("displayName")}</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              required
              className="max-w-sm"
            />
          </div>
          <div>
            <Button type="submit" disabled={pending}>
              {pending ? t("saving") : t("save")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Account Section
// ============================================================================

function AccountSection({
  email,
  emailVerified,
}: {
  email: string;
  emailVerified: boolean;
}) {
  const t = useTranslations("settings");
  const [resending, setResending] = useState(false);

  async function handleResendVerification() {
    setResending(true);
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/dashboard",
    });
    setResending(false);

    if (error) {
      toast.error(error.message ?? t("verificationFailed"));
      return;
    }

    toast.success(t("verificationSent"));
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("emailTitle")}</CardTitle>
          <CardDescription>{t("emailDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>{t("emailLabel")}</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="email"
                  value={email}
                  disabled
                  className="max-w-sm"
                />
                {emailVerified ? (
                  <Badge variant="success">{t("verified")}</Badge>
                ) : (
                  <Badge variant="warning">{t("unverified")}</Badge>
                )}
              </div>
            </div>

            {!emailVerified && (
              <div>
                <Button
                  variant="secondary"
                  onClick={handleResendVerification}
                  disabled={resending}
                >
                  {resending ? t("sending") : t("resendVerification")}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <DangerZone email={email} />
    </div>
  );
}

// ============================================================================
// Danger Zone (Delete Account)
// ============================================================================

function DangerZone({ email }: { email: string }) {
  const router = useRouter();
  const t = useTranslations("settings");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const confirmationWord = "DELETE";
  const canDelete = confirmText === confirmationWord;

  async function handleDeleteAccount() {
    setDeleting(true);
    const { error } = await authClient.deleteUser({});
    setDeleting(false);

    if (error) {
      toast.error(error.message ?? t("accountDeleteFailed"));
      return;
    }

    // Account is gone — send them back to the public landing page.
    router.push("/");
    router.refresh();
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">{t("dangerZone")}</CardTitle>
        <CardDescription>{t("dangerDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button variant="destructive" />}>
            {t("deleteAccount")}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("deleteAccountTitle")}</DialogTitle>
              <DialogDescription>
                {t.rich("deleteAccountDescription", {
                  email: () => (
                    <span className="font-medium text-foreground">{email}</span>
                  ),
                })}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-delete">
                {t.rich("confirmPrompt", {
                  word: () => (
                    <span className="font-mono font-semibold">
                      {confirmationWord}
                    </span>
                  ),
                })}
              </Label>
              <Input
                id="confirm-delete"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={confirmationWord}
                autoComplete="off"
              />
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                {t("cancel")}
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={!canDelete || deleting}
              >
                {deleting ? t("deletingAccount") : t("deleteAccount")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Security Section
// ============================================================================

function SecuritySection() {
  return (
    <div className="flex flex-col gap-6">
      <ChangePasswordCard />
      <SessionsCard />
    </div>
  );
}

function ChangePasswordCard() {
  const router = useRouter();
  const t = useTranslations("settings");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error(t("passwordTooShort"));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t("passwordsNoMatch"));
      return;
    }

    setPending(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setPending(false);

    if (error) {
      toast.error(error.message ?? t("passwordChangeFailed"));
      return;
    }

    toast.success(t("passwordChanged"));
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("changePasswordTitle")}</CardTitle>
        <CardDescription>{t("changePasswordDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="current-password">{t("currentPassword")}</Label>
            <Input
              id="current-password"
              name="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="max-w-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-password">{t("newPassword")}</Label>
            <Input
              id="new-password"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              placeholder={t("newPasswordPlaceholder")}
              className="max-w-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-password">{t("confirmNewPassword")}</Label>
            <Input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              className="max-w-sm"
            />
          </div>
          <div>
            <Button type="submit" disabled={pending}>
              {pending ? t("changing") : t("changePassword")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SessionsCard() {
  const t = useTranslations("settings");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingAll, setRevokingAll] = useState(false);

  async function loadSessions() {
    setLoading(true);
    const { data, error } = await authClient.listSessions();
    setLoading(false);

    if (error) {
      toast.error(error.message ?? t("sessionsLoadFailed"));
      return;
    }

    if (data) {
      setSessions(data as Session[]);
    }
  }

  useEffect(() => {
    let active = true;
    authClient.listSessions().then(({ data, error }) => {
      if (!active) return;
      setLoading(false);
      if (error) {
        toast.error(error.message ?? t("sessionsLoadFailed"));
        return;
      }
      if (data) setSessions(data as Session[]);
    });
    return () => {
      active = false;
    };
  }, [t]);

  async function handleRevokeSession(token: string) {
    const { error } = await authClient.revokeSession({ token });

    if (error) {
      toast.error(error.message ?? t("sessionRevokeFailed"));
      return;
    }

    toast.success(t("sessionSignedOut"));
    loadSessions();
  }

  async function handleRevokeOtherSessions() {
    setRevokingAll(true);
    const { error } = await authClient.revokeOtherSessions();
    setRevokingAll(false);

    if (error) {
      toast.error(error.message ?? t("otherSessionsRevokeFailed"));
      return;
    }

    toast.success(t("otherSessionsSignedOut"));
    loadSessions();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("sessionsTitle")}</CardTitle>
        <CardDescription>{t("sessionsDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">
              {t("loadingSessions")}
            </p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noSessions")}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {sessions.map((session) => (
                <SessionRow
                  key={session.token}
                  session={session}
                  onRevoke={() => handleRevokeSession(session.token)}
                />
              ))}
            </div>
          )}

          <Separator />

          <div>
            <Button
              variant="secondary"
              onClick={handleRevokeOtherSessions}
              disabled={revokingAll || loading || sessions.length <= 1}
            >
              {revokingAll ? t("signingOut") : t("signOutOtherDevices")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SessionRow({
  session,
  onRevoke,
}: {
  session: Session;
  onRevoke: () => void;
}) {
  const t = useTranslations("settings");
  const locale = useLocale();
  const [revoking, setRevoking] = useState(false);

  async function handleRevoke() {
    setRevoking(true);
    await onRevoke();
    setRevoking(false);
  }

  const createdAt = new Date(session.createdAt);
  const formattedDate = createdAt.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Parse user agent for a friendlier display
  const userAgent = session.userAgent ?? t("unknownDevice");
  const deviceInfo = parseUserAgent(userAgent);

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{deviceInfo}</span>
          {session.current && (
            <Badge variant="outline" className="text-xs">
              {t("current")}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {session.ipAddress && <span>{session.ipAddress}</span>}
          <span>{t("signedInOn", { date: formattedDate })}</span>
        </div>
      </div>
      {!session.current && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRevoke}
          disabled={revoking}
        >
          {revoking ? t("signingOut") : t("signOut")}
        </Button>
      )}
    </div>
  );
}

function parseUserAgent(ua: string): string {
  // Simple parsing for common browsers/platforms
  if (ua.includes("Chrome") && !ua.includes("Edg")) {
    if (ua.includes("Mobile")) return "Chrome (Mobile)";
    return "Chrome";
  }
  if (ua.includes("Firefox")) {
    if (ua.includes("Mobile")) return "Firefox (Mobile)";
    return "Firefox";
  }
  if (ua.includes("Safari") && !ua.includes("Chrome")) {
    if (ua.includes("Mobile")) return "Safari (Mobile)";
    return "Safari";
  }
  if (ua.includes("Edg")) {
    return "Microsoft Edge";
  }
  if (ua.includes("Windows")) return "Windows device";
  if (ua.includes("Mac")) return "Mac device";
  if (ua.includes("Linux")) return "Linux device";
  if (ua.includes("Android")) return "Android device";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS device";

  // Truncate if too long
  if (ua.length > 40) return ua.slice(0, 40) + "...";
  return ua;
}
