import { getAllProjects, getBatches } from "@/lib/data";
import TablePage from "@/components/pages/table-page";
import { getDictionary } from "@/lib/dictionary";

export const metadata = {
  title: "数据表格 | MiraclePlus Gallery",
  description: "按批次、标签筛选与排序的项目表格视图",
};

export default async function Page() {
  const projects = getAllProjects();
  const batches = getBatches();
  const dict = await getDictionary("zh");
  return (
    <TablePage
      initialProjects={projects}
      batches={batches}
      lang="zh"
      dict={dict}
    />
  );
}
