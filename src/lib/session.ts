import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** The user shape the app relies on, including the `role` additional field. */
export type SessionUser = (typeof auth.$Infer.Session)["user"];

/** The signed-in user's session on the server, or null. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Require a session in a server component / action; returns the user. */
export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }
  return session.user as SessionUser;
}

/** Require an admin (the first account); regular users are sent to the dashboard. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") {
    redirect("/dashboard");
  }
  return user;
}
