import prisma from "@/lib/prisma";
import AdminFaqsClient from "@/components/admin/AdminFaqsClient";

export default async function AdminFaqsPage() {
  const faqs = await prisma.faqs.findMany({ orderBy: { sort: "asc" } });
  return <AdminFaqsClient faqs={faqs.map((f) => ({
    id: f.id, question: f.question ?? "", answer: f.answer ?? "", sort: f.sort ?? 0, status: f.status ?? 0,
  }))} />;
}
