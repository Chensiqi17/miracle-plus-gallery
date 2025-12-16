import { getAllProjects, getProjectById, getRelatedProjects, getProjectsByBatch, getNetworkProjects } from "@/lib/data";
import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { ProjectCard } from "@/components/project-card";
import { ProjectImage } from "@/components/project-image";
import Link from "next/link";
import { ArrowLeft, GraduationCap, Briefcase, User, Link as LinkIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { Dictionary, Locale } from "@/lib/dictionary";

interface ProjectPageProps {
  id: string
  lang: Locale
  dict: Dictionary
}

export default function ProjectPage({ id, lang, dict }: ProjectPageProps) {
  const project = getProjectById(id);
  const t = dict.project;
  const prefix = lang === 'zh' ? '' : `/${lang}`;

  if (!project) {
    notFound();
  }

  const relatedData = getRelatedProjects(project);
  const networkProjects = getNetworkProjects(project);
  
  let sidebarProjects = networkProjects.map(n => ({ ...n.project, reason: n.reason }));
  
  if (sidebarProjects.length < 3) {
    const existingIds = new Set([project.id, ...relatedData.map(r => r.project.id), ...sidebarProjects.map(p => p.id)]);
    
    const batchFillers = getProjectsByBatch(project.batch_id)
      .filter(p => !existingIds.has(p.id))
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
      .slice(0, 3 - sidebarProjects.length);
      
    sidebarProjects = [...sidebarProjects, ...batchFillers.map(p => ({ ...p, reason: t.sidebar.same_batch }))];
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar lang={lang} dict={dict} />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <Link href={`${prefix}/batch/${project.batch_id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-brand mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.back_batch.replace('{batch}', project.batch_id)}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Hero Info */}
            <div className="space-y-6">
              {project.image_url ? (
                <ProjectImage 
                  src={project.image_url} 
                  alt={project.name}
                  priority
                />
              ) : (
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-secondary/30 relative flex items-center justify-center text-muted-foreground text-2xl font-bold">
                  {project.name}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h1 className="text-4xl font-bold">{project.name}</h1>
                </div>
                
                <p className="text-xl font-medium text-brand">
                  {project.one_liner}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-sm px-3 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Description */}
            <section>
              <h2 className="text-2xl font-bold mb-4">{t.intro}</h2>
              <div className="prose max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                {project.description}
              </div>
            </section>

            {/* Founders */}
            <section>
              <h2 className="text-2xl font-bold mb-6">{t.team}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.founders.map((founder, idx) => (
                  <div key={idx} className="bg-secondary/20 rounded-lg p-6 border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold">{founder.name}</div>
                        <div className="text-xs text-muted-foreground">{founder.role}</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
                      {founder.bio}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {founder.education.map(school => (
                        <Badge key={school} variant="outline" className="bg-background text-[10px] font-normal">
                          <GraduationCap className="mr-1 h-3 w-3" />
                          {school}
                        </Badge>
                      ))}
                      {founder.work_history.map(company => (
                        <Badge key={company} variant="outline" className="bg-background text-[10px] font-normal">
                          <Briefcase className="mr-1 h-3 w-3" />
                          {company}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-10">
            {relatedData.length > 0 && (
              <section>
                <h3 className="font-bold text-lg mb-4 flex items-center">
                  <span className="w-1 h-5 bg-brand rounded-full mr-2"></span>
                  {t.sidebar.similar}
                </h3>
                <div className="flex flex-col gap-4">
                  {relatedData.map(item => (
                    <div key={item.project.id} className="relative">
                      <ProjectCard project={item.project} />
                      <Badge variant="secondary" className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 h-5 bg-white/90 backdrop-blur shadow-sm border border-brand/10 text-brand z-10">
                        {t.sidebar.match}: {item.commonTags.slice(0, 2).join(", ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <span className="w-1 h-5 bg-secondary rounded-full mr-2"></span>
                {t.sidebar.network}
              </h3>
              <div className="flex flex-col gap-4">
                {sidebarProjects.map(p => (
                  <div key={p.id} className="relative">
                    <ProjectCard project={p} />
                    {p.reason && (
                      <Badge variant="secondary" className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 h-5 bg-white/90 backdrop-blur shadow-sm border border-brand/10 text-brand z-10">
                        {p.reason}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
