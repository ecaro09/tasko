"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type AreaChartProps,
  type BarChartProps,
  type LineChartProps,
  type PieChartProps,
  type RadarChartProps,
  type RadialBarChartProps,
  type ScatterChartProps,
  type ComposedChartProps,
  type FunnelChartProps,
  type TreemapProps,
  type SankeyProps,
  type BrushProps,
  type ReferenceLineProps,
  type ReferenceDotProps,
  type ReferenceAreaProps,
  type LegendProps,
} from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

// Re-exporting Chart components for convenience
export {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
};

// Define ChartTooltipContentProps to include active and label
interface CustomChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name: NameType;
    value: ValueType;
    color: string;
    dataKey: string;
  }>;
  label?: string | number;
  className?: string;
  formatter?: (
    value: ValueType,
    name: NameType,
    props: { payload: any; index: number; dataKey: string }
  ) => React.ReactNode;
  labelFormatter?: (label: string | number) => React.ReactNode;
}

const ChartTooltipContent = ({
  active,
  payload,
  label,
  className,
  formatter,
  labelFormatter,
}: CustomChartTooltipContentProps) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-background p-2 text-sm shadow-md",
        className
      )}
    >
      {label && (
        <div className="mb-1 font-semibold">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="grid gap-1">
        {payload.map((item, index) => (
          <div
            key={item.dataKey || index}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2">
              <span
                className="flex h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">
                {item.name || item.dataKey}
              </span>
            </div>
            <span className="font-mono font-medium text-foreground">
              {formatter ? formatter(item.value, item.name, { payload: item.payload, index, dataKey: item.dataKey }) : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { ChartTooltipContent };