"use client"

import { useState } from "react";
import { Project } from "@/lib/types";
import { TAXONOMY } from "@/lib/taxonomy";
import { useAnalytics } from "@/lib/hooks/use-analytics";
import { SectorTrendChart } from "@/components/charts/sector-trend-chart";
import { UniversityPowerChart } from "@/components/charts/university-power-chart";
import { FounderDNAChart } from "@/components/charts/founder-dna-chart";
import { FounderWorkHistoryChart } from "@/components/charts/founder-work-history-chart";
import { FounderTrendChart } from "@/components/charts/founder-trend-chart";
import { TeamSizeTrendChart } from "@/components/charts/team-size-trend-chart";
import { YearlyBuzzwords } from "@/components/charts/yearly-buzzwords";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Dictionary, Locale } from "@/lib/dictionary";

interface InsightsDashboardProps {
  projects: Project[];
  dict: Dictionary;
  lang?: Locale;
}

export function InsightsDashboard({ projects, dict, lang = 'zh' }: InsightsDashboardProps) {
  const t = dict.insights;
  const allYears = Array.from(new Set(projects.map(p => parseInt(p.batch_id.substring(0, 4))))).sort((a, b) => b - a);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleYear = (year: number) => {
    setSelectedYears(prev => prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const clearFilters = () => {
    setSelectedYears([]);
    setSelectedCategories([]);
  };

  const { filteredProjects, founderStats, workHistoryStats, founderTrendData } = useAnalytics(projects, {
    years: selectedYears,
    categories: selectedCategories
  });

  return (
    <div className="space-y-16 animate-in fade-in duration-700 pb-20">
      
      {/* 1. 顶部控制台 (Minimal Filter) */}
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-md py-4 border-b border-border/40">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <div className="text-sm text-muted-foreground">
                {t.current_sample}: <span className="font-mono text-foreground font-medium">{filteredProjects.length}</span> / {projects.length}
             </div>
             {(selectedYears.length > 0 || selectedCategories.length > 0) && (
                <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t.reset_filter}
                </button>
             )}
          </div>
          
          <div className="flex flex-wrap gap-x-8 gap-y-3">
             <div className="flex items-center gap-3">
               <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.year}</span>
               <div className="flex gap-3">
                 {allYears.map(year => (
                    <label key={year} className="flex items-center gap-1.5 cursor-pointer group">
                      <Checkbox 
                        className="w-3.5 h-3.5"
                        checked={selectedYears.includes(year)} 
                        onCheckedChange={() => toggleYear(year)} 
                      />
                      <span className={`text-sm group-hover:text-foreground transition-colors ${selectedYears.includes(year) ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {year}
                      </span>
                    </label>
                 ))}
               </div>
             </div>

             <div className="w-px h-4 bg-border/60 self-center hidden sm:block" />

             <div className="flex items-center gap-3">
               <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.category}</span>
               <div className="flex flex-wrap gap-3">
                 {TAXONOMY.map(node => (
                    <label key={node.category} className="flex items-center gap-1.5 cursor-pointer group">
                      <Checkbox 
                         className="w-3.5 h-3.5"
                         checked={selectedCategories.includes(node.category)} 
                         onCheckedChange={() => toggleCategory(node.category)} 
                      />
                      <span className={`text-sm group-hover:text-foreground transition-colors ${selectedCategories.includes(node.category) ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {dict?.taxonomy?.[node.category] || node.label}
                      </span>
                    </label>
                 ))}
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* 2. 关键指标 (Key Metrics - Pure & Elegant) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8 px-2">
        {[
          { label: t.metrics.total_projects, value: founderStats.totalProjects },
          { label: t.metrics.total_founders, value: founderStats.totalFounders },
          { label: t.metrics.advanced_degree, value: `${(founderStats.advancedDegreeRatio * 100).toFixed(1)}%` },
          { label: t.metrics.overseas_bg, value: `${(founderStats.overseasRatio * 100).toFixed(1)}%` },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col items-start space-y-1">
            <span className="text-xs text-muted-foreground font-medium tracking-wide">{stat.label}</span>
            <span className="text-3xl font-light tracking-tight text-foreground font-sans">
              {stat.value}
            </span>
          </div>
        ))}
      </section>

      <Separator className="opacity-50" />

      {/* 3. 趋势洞察 (Trend Insights) */}
      <section className="space-y-8">
        <div className="px-2">
           <h2 className="text-xl font-light tracking-tight text-foreground">{t.trends.title}</h2>
           <p className="text-sm text-muted-foreground mt-1 max-w-2xl font-light">
             {t.trends.desc}
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
           <div className="lg:col-span-3 space-y-4">
              <SectorTrendChart 
                key={selectedCategories.join(',')}
                projects={filteredProjects} 
                selectedCategories={selectedCategories as any} 
                dict={dict}
              />
           </div>
           <div className="lg:col-span-2">
              <YearlyBuzzwords projects={filteredProjects} dict={dict} lang={lang} />
           </div>
        </div>
      </section>

      <Separator className="opacity-50" />

      {/* 4. 人才与创新源头 (Talent & Source) */}
      <section className="space-y-12">
        <div className="px-2">
           <h2 className="text-xl font-light tracking-tight text-foreground">{t.source.title}</h2>
           <p className="text-sm text-muted-foreground mt-1 max-w-2xl font-light">
             {t.source.desc}
           </p>
        </div>

        {/* Founder DNA (Persona) - Top Priority */}
        <div className="bg-card/50 rounded-xl p-6 border border-border/50">
           <h3 className="text-sm font-medium text-muted-foreground mb-6">{t.source.persona_dist}</h3>
           <FounderDNAChart stats={founderStats} dict={dict} />
        </div>

        {/* Trends Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-6 pl-2">{t.source.persona_trend}</h3>
              <FounderTrendChart data={founderTrendData} dict={dict} />
           </div>
           <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-6 pl-2">{t.source.team_size}</h3>
              <TeamSizeTrendChart data={founderTrendData} dict={dict} />
           </div>
        </div>

        {/* Source Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           <div>
             <h3 className="text-sm font-medium text-muted-foreground mb-6 pl-2">{t.source.top_uni}</h3>
             <UniversityPowerChart projects={filteredProjects} height={400} dict={dict} lang={lang} />
           </div>

           <div>
             <h3 className="text-sm font-medium text-muted-foreground mb-6 pl-2">{t.source.top_company}</h3>
             <FounderWorkHistoryChart stats={workHistoryStats} height={400} dict={dict} />
           </div>
        </div>
      </section>

    </div>
  );
}
