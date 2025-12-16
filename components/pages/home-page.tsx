import { Navbar } from "@/components/navbar";
import { SearchHero } from "@/components/search-hero";
import { getBatches, getAllProjects, getGlobalStats } from "@/lib/data";
import { SectorTrendChart } from "@/components/charts/sector-trend-chart";
import { UniversityPowerChart } from "@/components/charts/university-power-chart";
import Link from "next/link";
import { Sparkles, Zap, GraduationCap, Globe, Database, Users, TrendingUp, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dictionary, Locale } from "@/lib/dictionary";
import { getTranslatedTag, getTranslatedStat } from "@/lib/tag-translations";

interface HomePageProps {
  lang: Locale
  dict: Dictionary
}

export default function HomePage({ lang, dict }: HomePageProps) {
  const batches = getBatches();
  const projects = getAllProjects();
  const stats = getGlobalStats();

  const t = dict.home;
  const prefix = lang === 'zh' ? '' : `/${lang}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar lang={lang} dict={dict} />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="flex flex-col items-center space-y-4 text-center">
            <Badge variant="brand" className="px-3 py-1 text-sm">
              {t.hero.badge}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              {t.hero.title_line1}<br /> {t.hero.title_line2}
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              {t.hero.description_line1}
              <br/>
              {t.hero.description_line2}
            </p>
            
            {/* Search Component */}
            <div className="w-full max-w-2xl mx-auto z-20">
              {/* Note: SearchHero might need refactoring later to support i18n placeholders */}
              <SearchHero dict={dict} />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 w-full max-w-3xl">
              <div className="flex flex-col items-center p-4 rounded-lg bg-secondary/20 border border-border/50">
                <Database className="h-5 w-5 mb-2 text-brand" />
                <span className="text-2xl font-bold">{stats.totalProjects}</span>
                <span className="text-xs text-muted-foreground">{t.hero.stats.projects}</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-secondary/20 border border-border/50">
                <Users className="h-5 w-5 mb-2 text-brand" />
                <span className="text-2xl font-bold">{stats.totalFounders}</span>
                <span className="text-xs text-muted-foreground">{t.hero.stats.founders}</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-secondary/20 border border-border/50">
                <GraduationCap className="h-5 w-5 mb-2 text-brand" />
                <span className="text-2xl font-bold">{(stats.advancedDegreeRatio * 100).toFixed(0)}%</span>
                <span className="text-xs text-muted-foreground">{t.hero.stats.masters}</span>
              </div>
               <div className="flex flex-col items-center p-4 rounded-lg bg-secondary/20 border border-border/50">
                <Globe className="h-5 w-5 mb-2 text-brand" />
                <span className="text-2xl font-bold">{(stats.overseasRatio * 100).toFixed(0)}%</span>
                <span className="text-xs text-muted-foreground">{t.hero.stats.overseas}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background gradient decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
      </section>

      {/* Global Insights Dashboard */}
      <section className="py-12 bg-secondary/30">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="flex flex-col space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">{t.insights_section.title}</h2>
              <p className="text-muted-foreground">{t.insights_section.subtitle}</p>
            </div>
            <Link href={`${prefix}/insights`} className="self-center md:self-auto">
              <Button size="lg" className="group shadow-lg hover:shadow-brand/20 transition-all">
                {t.insights_section.cta}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-background/50 rounded-xl p-6 border border-border/50 shadow-sm flex flex-col">
              <div className="mb-6">
                 <h3 className="text-lg font-bold">{t.insights_section.sector_chart.title}</h3>
                 <p className="text-sm text-muted-foreground">{t.insights_section.sector_chart.desc}</p>
              </div>
               {/* Mobile: 300px, Desktop: 400px */}
               <div className="md:hidden">
                 <SectorTrendChart projects={projects} height={300} dict={dict} />
               </div>
               <div className="hidden md:block">
                 <SectorTrendChart projects={projects} height={400} dict={dict} />
               </div>
            </div>
            <div className="bg-background/50 rounded-xl p-6 border border-border/50 shadow-sm flex flex-col">
              <div className="mb-6">
                 <h3 className="text-lg font-bold">{t.insights_section.uni_chart.title}</h3>
                 <p className="text-sm text-muted-foreground">{t.insights_section.uni_chart.desc}</p>
              </div>
               {/* Mobile: 250px, Desktop: 400px */}
               <div className="md:hidden">
                 <UniversityPowerChart projects={projects} limit={10} height={250} dict={dict} lang={lang} />
               </div>
               <div className="hidden md:block">
                 <UniversityPowerChart projects={projects} limit={10} height={400} dict={dict} lang={lang} />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Batches List */}
      <section className="py-16">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">{t.batches_section.title}</h2>
            <p className="text-muted-foreground max-w-[600px]">
              {t.batches_section.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {batches.map((batch) => {
              const batchInfo = (dict.batches.batch_info as any)?.[batch.id] || {};
              const displayName = batchInfo.name || batch.name;
              const displayDesc = batchInfo.desc || batch.description;

              if (batch.disabled) {
                return (
                  <div key={batch.id} className="relative overflow-hidden rounded-xl border border-dashed border-muted-foreground/20 bg-muted/30 p-8 h-full flex flex-col justify-center items-center text-center">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                    <div className="relative z-10 flex flex-col items-center gap-4 opacity-60">
                       <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="text-lg px-3 py-1 bg-transparent border-dashed text-muted-foreground">
                            {batch.year} {batch.season === 'Spring' ? t.batches_section.season.spring : t.batches_section.season.fall}
                          </Badge>
                       </div>
                      <h3 className="text-2xl font-bold text-muted-foreground">
                        {displayName}
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-[200px]">
                        {displayDesc}
                      </p>
                    </div>
                  </div>
                );
              }

              return (
              <Link key={batch.id} href={`${prefix}/batch/${batch.id}`} className="group block touch-manipulation active:scale-[0.99] transition-transform">
                <div className="relative overflow-hidden rounded-xl border-0 shadow-sm bg-card text-card-foreground transition-all [@media(hover:hover)]:hover:shadow-xl [@media(hover:hover)]:hover:-translate-y-1 h-full">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {batch.year} {batch.season === 'Spring' ? t.batches_section.season.spring : t.batches_section.season.fall}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{batch.date}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-brand transition-colors">
                      {displayName}
                    </h3>
                    <p className="text-muted-foreground mb-6 line-clamp-2">
                      {displayDesc}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-brand" />
                        <span>{batch.stats.project_count} {t.batches_section.stats.projects}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-brand" />
                        <span>{t.batches_section.stats.acceptance} {batch.stats.acceptance_rate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-brand" />
                        <span>{getTranslatedStat(batch.stats.phd_ratio || "", lang)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-brand" />
                        <span>{batch.stats.overseas_experience || t.batches_section.stats.global}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {batch.highlights.slice(0, 3).map(tag => (
                        <span key={tag} className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-gray-500/10">
                          {getTranslatedTag(tag, lang)}
                        </span>
                      ))}
                      {batch.highlights.length > 3 && (
                        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                          +{batch.highlights.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="py-6 border-t border-border/40 bg-secondary/30">
        <div className="container px-4 mx-auto text-center text-sm text-muted-foreground">
          <p>{dict.common.footer.copyright}</p>
          <p className="mt-2">
            {dict.common.footer.techStack}
          </p>
        </div>
      </footer>
    </div>
  );
}
