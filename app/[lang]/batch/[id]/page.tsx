import BatchPage from "@/components/pages/batch-page"
import { getDictionary, Locale } from "@/lib/dictionary"
import { getBatches } from "@/lib/data"

export async function generateStaticParams() {
  const batches = getBatches()
  const params = []
  for (const batch of batches) {
    params.push({ lang: 'en', id: batch.id })
    params.push({ lang: 'zh', id: batch.id })
  }
  return params
}

export default async function Page({ params }: { params: Promise<{ lang: Locale, id: string }> }) {
  const { lang, id } = await params
  const dict = await getDictionary(lang)
  return <BatchPage id={id} lang={lang} dict={dict} />
}
