import ProjectPage from "@/components/pages/project-page"
import { getDictionary, Locale } from "@/lib/dictionary"
import { getAllProjects } from "@/lib/data"

export async function generateStaticParams() {
  const projects = getAllProjects()
  const params = []
  for (const project of projects) {
    params.push({ lang: 'en', id: project.id })
    params.push({ lang: 'zh', id: project.id })
  }
  return params
}

export default async function Page({ params }: { params: Promise<{ lang: Locale, id: string }> }) {
  const { lang, id } = await params
  const dict = await getDictionary(lang)
  return <ProjectPage id={id} lang={lang} dict={dict} />
}
