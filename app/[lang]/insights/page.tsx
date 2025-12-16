import { getAllProjects } from "@/lib/data";
import { Navbar } from "@/components/navbar";
import { InsightsDashboard } from "@/components/pages/insights-dashboard";
import { getDictionary, Locale } from "@/lib/dictionary";

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'zh' }]
}

export default async function InsightsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const projects = getAllProjects();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar lang={lang} dict={dict} />
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="flex flex-col space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{dict.insights.title}</h1>
          <p className="text-muted-foreground">
            {dict.insights.subtitle.replace('{count}', projects.length.toString())}
          </p>
        </div>
        
        <InsightsDashboard projects={projects} dict={dict} lang={lang} />
      </main>
    </div>
  );
}
