import prisma from "@/lib/prisma";
import AdminSettingsClient from "@/components/admin/AdminSettingsClient";

export default async function AdminSettingsPage() {
  const options = await prisma.general_options.findMany();
  const settings: Record<string, string> = {};
  for (const opt of options) {
    if (opt.name) settings[opt.name] = opt.value ?? "";
  }
  return <AdminSettingsClient initialSettings={settings} />;
}
