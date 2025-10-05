"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Funnel,
  FunnelChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Sector,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
  // Recharts types are often imported from 'recharts/types' or inferred from components
  // Using React.ComponentProps for better compatibility
} from "recharts";
import type {
  ContentProps as TooltipContentProps,
  NameType,
  Payload as TooltipPayload,
  Props as TooltipProps,
  ValueType,
} from "recharts/types/component/Tooltip";
import type {
  LegendProps,
  Payload as LegendPayload,
} from "recharts/types/component/Legend";

import { cn } from "@/lib/utils";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"; // Self-referential import, will be removed

// Re-exporting components defined in this file
export {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
};

// Define types using React.ComponentProps for Recharts components
type AreaChartProps = React.ComponentProps<typeof AreaChart>;
type BarChartProps = React.ComponentProps<typeof BarChart>;
type LineChartProps = React.ComponentProps<typeof LineChart>;
type PieChartProps = React.ComponentProps<typeof PieChart>;
type RadarChartProps = React.ComponentProps<typeof RadarChart>;
type RadialBarChartProps = React.ComponentProps<typeof RadialBarChart>;
type ScatterChartProps = React.ComponentProps<typeof ScatterChart>;
type ComposedChartProps = React.ComponentProps<typeof ComposedChart>;
type FunnelChartProps = React.ComponentProps<typeof FunnelChart>;
type TreemapProps = React.ComponentProps<typeof Treemap>;
type SankeyProps = React.ComponentProps<typeof Sankey>;
type BrushProps = React.ComponentProps<typeof Brush>;


// --- Chart
const ChartContext = React.createContext<ChartContextProps | null>(null);

function Chart({
  config,
  children,
  className,
  ...props
}: React.ComponentProps<typeof ResponsiveContainer> & {
  config: ChartConfig;
}) {
  const defaultId = React.useId();
  const [id] = React.useState(defaultId);

  return (
    <ChartContext.Provider value={{ config, id }}>
      <div className={cn("h-[400px] w-full", className)} {...props}>
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

// --- ChartContainer
function ChartContainer({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[200px] w-full flex-col items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// --- ChartTooltip
function ChartTooltip({
  cursor = false,
  content,
  className,
  formatter,
  ...props
}: TooltipProps & {
  content?: React.ComponentPropsWithoutRef<"div">["children"];
}) {
  const { id, config } = React.useContext(ChartContext) as ChartContextProps;

  return (
    <Tooltip
      cursor={cursor}
      content={({ active, payload, label }) => {
        if (active && payload && payload.length) {
          return (
            <ChartTooltipContent
              config={config}
              payload={payload}
              label={label}
              formatter={formatter}
            >
              {content}
            </ChartTooltipContent>
          );
        }
        return null;
      }}
      wrapperStyle={{ outline: "none" }}
      {...props}
    />
  );
}

// --- ChartTooltipContent
function ChartTooltipContent({
  className,
  payload,
  label,
  config,
  formatter,
  children,
}: TooltipContentProps & {
  config: ChartConfig;
  payload?: TooltipPayload[];
  label?: string | number;
  formatter?: TooltipProps["formatter"];
}) {
  if (!payload || !payload.length) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-background p-2 text-sm shadow-md",
        className,
      )}
    >
      <div className="grid gap-1">
        {label && <div className="font-medium">{label}</div>}
        {payload.map((item, index) => (
          <div
            key={item.dataKey}
            className="flex items-center justify-between gap-x-4"
          >
            <div className="flex items-center gap-x-2">
              <span
                className="flex h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-mono font-medium text-foreground">
              {formatter
                ? formatter(item.value, item.name, item, index) // Corrected formatter signature
                : item.value}
            </span>
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}

// --- ChartLegend
function ChartLegend({
  className,
  content,
  ...props
}: LegendProps & {
  content?: React.ComponentPropsWithoutRef<"div">["children"];
}) {
  const { id, config } = React.useContext(ChartContext) as ChartContextProps;

  return (
    <Legend
      content={({ payload }) => {
        if (content) {
          return content;
        }

        return (
          <ChartLegendContent config={config} payload={payload} className={className} />
        );
      }}
      {...props}
    />
  );
}

// --- ChartLegendContent
function ChartLegendContent({
  className,
  payload,
  config,
}: {
  className?: string;
  payload?: LegendPayload[];
  config: ChartConfig;
}) {
  if (!payload || !payload.length) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-4 p-2 text-sm",
        className,
      )}
    >
      {payload.map((item) => {
        const activeConfig = config[item.value as keyof ChartConfig];
        if (!activeConfig) {
          return null;
        }
        return (
          <div
            key={item.value}
            className={cn(
              "flex items-center gap-1.5",
              item.inactive && "text-muted-foreground",
            )}
          >
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{
                backgroundColor: item.color,
              }}
            />
            <span>{activeConfig.label}</span>
          </div>
        );
      })}
    </div>
  );
}

interface ChartContextProps {
  config: ChartConfig;
  id: string;
}

// Export all components
export {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  // Recharts components
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Funnel,
  FunnelChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Sector,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
};