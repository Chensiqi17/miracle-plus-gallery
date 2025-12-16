import HomePage from "@/components/pages/home-page"
import { getDictionary, Locale } from "@/lib/dictionary"

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'zh' }]
}

export default async function Page({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <HomePage lang={lang} dict={dict} />
}
