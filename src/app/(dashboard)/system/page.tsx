import { getFormatter, getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/session";
import { getSystemStatus, getSystemStatusSummary } from "@/lib/system-status";
import { db } from "@/lib/db";
import { emailLog } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { cn } from "@/lib/utils";
import { AnimatedBlock, interactiveBlockClassName } from "@/components/animated-block";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function getStatusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "sent":
    case "delivered":
      return "default";
    case "logged":
    case "pending":
      return "secondary";
    case "failed":
    case "bounced":
    case "complained":
      return "destructive";
    default:
      return "outline";
  }
}

export default async function SystemPage() {
  await requireAdmin();

  const t = await getTranslations("system");
  const format = await getFormatter();

  const statusItems = getSystemStatus();
  const statusSummary = getSystemStatusSummary();

  const emails = await db
    .select()
    .from(emailLog)
    .orderBy(desc(emailLog.createdAt))
    .limit(100);

  return (
    <div className="space-y-8">
      <AnimatedBlock index={0}>
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
      </AnimatedBlock>

      {/* Configuration Health Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{t("configuration")}</h2>
          <Badge variant="secondary">
            {t("configuredCount", {
              configured: statusSummary.configured,
              total: statusSummary.total,
            })}
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {statusItems.map((item, index) => (
            <AnimatedBlock key={item.key} index={index}>
              <Card
                size="sm"
                className={cn("h-full", interactiveBlockClassName)}
              >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm">{item.label}</CardTitle>
                  <Badge variant={item.configured ? "success" : "secondary"}>
                    {item.configured ? t("configured") : t("devMode")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </CardContent>
              </Card>
            </AnimatedBlock>
          ))}
        </div>
      </section>

      {/* Email Activity Section */}
      <AnimatedBlock index={statusItems.length + 1} className="space-y-4">
        <h2 className="text-lg font-semibold">{t("emailActivity")}</h2>

        {emails.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">{t("noEmails")}</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("colRecipient")}</TableHead>
                    <TableHead>{t("colTemplate")}</TableHead>
                    <TableHead>{t("colSubject")}</TableHead>
                    <TableHead>{t("colStatus")}</TableHead>
                    <TableHead className="text-right">{t("colTime")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-mono text-xs">
                        {email.to}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {email.template}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-48 truncate">
                        {email.subject}
                      </TableCell>
                      <TableCell>
                        {email.status === "failed" && email.error ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Badge
                                    variant={getStatusBadgeVariant(email.status)}
                                    className="cursor-help"
                                  />
                                }
                              >
                                {email.status}
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <p className="text-xs">{email.error}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Badge variant={getStatusBadgeVariant(email.status)}>
                            {email.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {format.relativeTime(email.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Resend hint for failed emails */}
        {emails.some((e) => e.status === "failed") && (
          <p className="text-sm text-muted-foreground">{t("failedHint")}</p>
        )}
      </AnimatedBlock>
    </div>
  );
}
