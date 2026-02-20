import prisma from "@/lib/prisma";
import AdminLanguagesClient from "@/components/admin/AdminLanguagesClient";

export default async function AdminLanguagesPage() {
  const languages = await prisma.general_lang_list.findMany({ orderBy: { id: "asc" } });
  return <AdminLanguagesClient languages={languages.map((l) => ({
    id: l.id, ids: l.ids ?? "", code: l.code ?? "", country_code: l.country_code ?? "",
    is_default: l.is_default ?? 0, status: l.status ?? 0,
  }))} />;
}
