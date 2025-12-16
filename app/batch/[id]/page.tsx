import BatchPage from "@/components/pages/batch-page"
import { getDictionary } from "@/lib/dictionary"
import { getBatches } from "@/lib/data"

export async function generateStaticParams() {
  const batches = getBatches();
  return batches.map((batch) => ({
    id: batch.id,
  }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dict = await getDictionary('zh')
  return <BatchPage id={id} lang="zh" dict={dict} />
}