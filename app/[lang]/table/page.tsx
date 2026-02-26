import { getAllProjects, getBatches, getTableEdits } from "@/lib/data";
import TablePage from "@/components/pages/table-page";
import { getDictionary, Locale } from "@/lib/dictionary";

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "zh" }];
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const projects = getAllProjects();
  const batches = getBatches();
  const tableEdits = getTableEdits();
  const dict = await getDictionary(lang as Locale);
  return (
    <TablePage
      initialProjects={projects}
      batches={batches}
      initialTableEdits={tableEdits}
      lang={lang as Locale}
      dict={dict}
    />
  );
}
