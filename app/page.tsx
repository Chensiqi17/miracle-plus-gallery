import HomePage from "@/components/pages/home-page"
import { getDictionary } from "@/lib/dictionary"

export default async function Page() {
  const dict = await getDictionary('zh')
  return <HomePage lang="zh" dict={dict} />
}