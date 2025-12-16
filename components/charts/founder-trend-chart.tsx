"use client"

import { ChartBase } from "@/components/ui/chart-base";
import { Dictionary } from "@/lib/dictionary";

interface FounderTrendChartProps {
  data: {
    name: string;
    phd: number;
    young: number;
    overseas: number;
    serial: number;
    avgTeamSize: number;
  }[];
  dict?: Dictionary;
}

export function FounderTrendChart({ data, dict }: FounderTrendChartProps) {
  const t = dict?.explore || {
    phd: "含博士成员",
    overseas: "海外背景"
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        let res = `<div class="font-medium mb-1">${params[0].name}</div>`;
        params.forEach((p: any) => {
           const val = (p.value * 100).toFixed(1) + '%';
           res += `
            <div class="flex items-center justify-between gap-4 text-xs">
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full" style="background-color: ${p.color}"></span>
                ${p.seriesName}
              </span>
              <span class="font-mono font-medium">${val}</span>
            </div>
           `;
        });
        return res;
      }
    },
    legend: {
      top: '0%',
      icon: 'circle',
      itemGap: 20
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
      axisLabel: {
        formatter: (val: number) => `${(val * 100).toFixed(0)}%`
      },
      splitLine: {
        lineStyle: { type: 'dashed', opacity: 0.3 }
      }
    },
    series: [
      {
        name: dict?.charts?.founder_metrics?.phd || "博士/PhD",
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: data.map(d => d.phd),
        itemStyle: { color: '#a855f7' }, // Purple-500
        lineStyle: { width: 3 }
      },
      {
        name: dict?.charts?.founder_metrics?.overseas || "海外背景",
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: data.map(d => d.overseas),
        itemStyle: { color: '#3b82f6' }, // Blue-500
        lineStyle: { width: 3 }
      },
      {
        name: dict?.charts?.founder_metrics?.serial || '连续创业',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: data.map(d => d.serial),
        itemStyle: { color: '#10b981' }, // Emerald-500
        lineStyle: { width: 3 }
      },
      {
        name: dict?.charts?.founder_metrics?.young || '00后/在读',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: data.map(d => d.young),
        itemStyle: { color: '#ec4899' }, // Pink-500
        lineStyle: { width: 3 }
      }
    ]
  };

  return (
    <ChartBase options={option} height={300} minimal={true} />
  );
}
