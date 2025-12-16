"use client"

import { ChartBase } from "@/components/ui/chart-base";
import * as echarts from 'echarts';
import { Dictionary } from "@/lib/dictionary";

interface TeamSizeTrendChartProps {
  data: {
    name: string;
    avgTeamSize: number;
  }[];
  dict?: Dictionary;
}

export function TeamSizeTrendChart({ data, dict }: TeamSizeTrendChartProps) {
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const val = params[0].value.toFixed(2);
        return `
          <div class="font-medium mb-1">${params[0].name}</div>
          <div class="flex items-center justify-between gap-4 text-xs">
             <span>${dict?.charts?.avg_size || '平均创始团队规模'}</span>
             <span class="font-mono font-bold">${val} ${dict?.charts?.team_size_label || '人'}</span>
          </div>
        `;
      }
    },
    legend: {
      top: '0%',
      icon: 'circle'
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '5%',
      top: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(d => d.name),
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      min: 1,
      splitLine: {
        lineStyle: { type: 'dashed', opacity: 0.3 }
      }
    },
    series: [
      {
        name: dict?.charts?.avg_size || '平均创始团队规模',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: data.map(d => d.avgTeamSize),
        itemStyle: { color: '#f59e0b' }, // Amber-500
        lineStyle: { width: 3 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
            { offset: 1, color: 'rgba(245, 158, 11, 0.05)' }
          ])
        }
      }
    ]
  };

  return (
    <ChartBase options={option} height={300} minimal={true} />
  );
}
