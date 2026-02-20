import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ProfileForm from "@/components/dashboard/ProfileForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const uid = session!.user.uid;

  const user = await prisma.general_users.findUnique({
    where: { id: uid },
    select: { id: true, first_name: true, last_name: true, email: true, timezone: true, api_key: true, more_information: true },
  });

  let moreInfo: any = {};
  try { moreInfo = user?.more_information ? JSON.parse(user.more_information) : {}; } catch {}

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <h1 className="text-headline text-label-primary">Profile</h1>
      <ProfileForm user={{
        first_name: user?.first_name || "", last_name: user?.last_name || "",
        email: user?.email || "", timezone: user?.timezone || "",
        api_key: user?.api_key || "",
        website: moreInfo.website || "", phone: moreInfo.phone || "", skype_id: moreInfo.skype_id || "",
      }} />
    </div>
  );
}
