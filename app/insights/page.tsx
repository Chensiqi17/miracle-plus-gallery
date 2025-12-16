import { getAllProjects } from "@/lib/data";
import { Navbar } from "@/components/navbar";
import { InsightsDashboard } from "@/components/pages/insights-dashboard";
import { getDictionary } from "@/lib/dictionary";

export default async function InsightsPage() {
  const projects = getAllProjects();
  const dict = await getDictionary('zh');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar lang="zh" dict={dict} />
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="flex flex-col space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{dict.insights.title}</h1>
                    <p className="text-muted-foreground">
                      {dict.insights.subtitle.replace('{count}', projects.length.toString())}
                    </p>
                  </div>
                  
                  <InsightsDashboard projects={projects} dict={dict} lang="zh" />
                </main>
              </div>
            );
          }
          