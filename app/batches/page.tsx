import BatchesPage from "@/components/pages/batches-page"
import { getDictionary } from "@/lib/dictionary"

export default async function Page() {
  const dict = await getDictionary('zh')
  return <BatchesPage lang="zh" dict={dict} />
}