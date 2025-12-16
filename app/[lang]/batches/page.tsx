import BatchesPage from "@/components/pages/batches-page"
import { getDictionary, Locale } from "@/lib/dictionary"

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'zh' }]
}

export default async function Page({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  return <BatchesPage lang={lang} dict={dict} />
}
