import ProjectPage from "@/components/pages/project-page"
import { getDictionary } from "@/lib/dictionary"
import { getAllProjects } from "@/lib/data"

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((project) => ({
    id: project.id,
  }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dict = await getDictionary('zh')
  return <ProjectPage id={id} lang="zh" dict={dict} />
}