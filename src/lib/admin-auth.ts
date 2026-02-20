import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.isAdmin) return null;
  return session;
}
