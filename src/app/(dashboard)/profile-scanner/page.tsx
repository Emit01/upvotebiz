import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ProfileScannerClient from "@/components/dashboard/ProfileScannerClient";

export default async function ProfileScannerPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.uid) redirect("/login");

  const uid = session.user.uid as number;

  const items = await prisma.profile_scan.findMany({
    where: { uid },
    orderBy: { id: "desc" },
  });

  const itemsProfileScans = items.map((i) => ({
    id: i.id,
    username: i.username ?? "",
    category: i.category,
    whitelist: i.whitelist ?? "",
    blacklist: i.blacklist ?? "",
    no_of_upvotes: i.no_of_upvotes,
    no_of_upvotes2: i.no_of_upvotes2,
    rank: i.rank ?? "",
    rank2: i.rank2 ?? "",
    speed: i.speed,
    position_time: i.position_time,
    service_id: i.service_id,
  }));

  return (
    <div className="space-y-6">
      <ProfileScannerClient initialItems={itemsProfileScans} />
    </div>
  );
}
