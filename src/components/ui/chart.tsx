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
} from "recharts";
import type { Payload as RechartsTooltipPayload } from "recharts/types/component/Tooltip";
import type { Payload as RechartsLegendPayload } from "recharts/types/component/Legend";

import { cn } from "@/lib/utils";

// Define types using React.ComponentProps for Recharts components
type TooltipProps = React.ComponentProps<typeof Tooltip>;
type LegendProps = React.ComponentProps<typeof Legend>;

// ChartConfig type definition (assuming it's defined elsewhere or needs to be here)
export type ChartConfig = {
  [key: string]: {
    label: string;
    color?: string;
    icon?: React.ComponentType<{ className?: string }>;
  };
};

interface ChartContextProps {
  config: ChartConfig;
  id: string;
}

// --- Chart
function Chart({
  config,
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  config: ChartConfig;
} & React.ComponentProps<typeof ResponsiveContainer>) {
  const defaultId = React.useId();
  const [id] = React.useState(defaultId);

  // Separate props for the outer div and ResponsiveContainer
  const { aspect, width, height, minWidth, minHeight, initialDimension, ...divProps } = props;

  return (
    <ChartContext.Provider value={{ config, id }}>
      <div className={cn("h-[400px] w-full", className)} {...divProps}>
        <ResponsiveContainer
          aspect={aspect}
          width={width}
          height={height}
          minWidth={minWidth}
          minHeight={minHeight}
          initialDimension={initialDimension}
        >
          {children}
        </ResponsiveContainer>
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
  content?: React.ReactNode; // Use React.ReactNode for content
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
              payload={payload as RechartsTooltipPayload[]} // Cast to RechartsTooltipPayload[]
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
}: {
  className?: string;
  payload?: RechartsTooltipPayload[];
  label?: string | number;
  config: ChartConfig;
  formatter?: TooltipProps["formatter"];
  children?: React.ReactNode;
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
                ? formatter(item.value, item.name, item, index)
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
  content?: React.ReactNode;
}) {
  const { id, config } = React.useContext(ChartContext) as ChartContextProps;

  return (
    <Legend
      content={({ payload }) => {
        if (content) {
          return content;
        }

        return (
          <ChartLegendContent config={config} payload={payload as RechartsLegendPayload[]} className={className} />
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
  payload?: RechartsLegendPayload[];
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