"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/project-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Project } from "@/lib/types";
import { Dictionary } from "@/lib/dictionary";

interface BatchProjectListProps {
  projects: Partial<Project>[];
  topTags: string[];
  dict?: Dictionary;
}

export function BatchProjectList({ projects, topTags, dict }: BatchProjectListProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const t = dict?.batches.list || { all: "全部", showing: "显示 {count} 个项目" };

  const filteredProjects = selectedTag
    ? projects.filter((p) => p.tags?.includes(selectedTag))
    : projects;

  return (
    <div className="flex flex-col gap-8">
      {/* 简单的标签云展示 */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium py-1">{t.all === "All" ? "Hot Tags:" : "热门赛道："}</span>
        <Badge 
            variant={selectedTag === null ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/90 transition-colors"
            onClick={() => setSelectedTag(null)}
        >
            {t.all}
        </Badge>
        {topTags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTag === tag ? "default" : "outline"}
            className={cn(
                "cursor-pointer transition-colors",
                selectedTag === tag 
                  ? "hover:bg-primary/90" 
                  : "hover:bg-secondary/80 hover:text-foreground"
            )}
            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project as Project} />
        ))}
        {filteredProjects.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                {t.all === "All" ? "No projects found in this category." : "该分类下暂无项目"}
            </div>
        )}
      </div>
    </div>
  );
}
