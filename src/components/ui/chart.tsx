"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Bar,
  BarChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  Dot,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type {
  Payload,
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { cn } from "@/lib/utils";

// Can't use a Record here since the keys are dynamic.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartConfigPayload = { [key: string]: any };

type ChartContextProps = {
  config: ChartConfigPayload;
  activeConfig: ChartConfigPayload;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

type ChartConfig = {
  [k: string]: {
    label?: string;
    icon?: React.ComponentType<{ className?: string }>;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<string, string> }
  );
};

const THEMES = {
  light: "",
  dark: ".dark",
} as const;

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(
    ([_, itemConfig]) => itemConfig.theme || itemConfig.color,
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
  ${colorConfig
    .map(([key, itemConfig]) => {
      const color = itemConfig.theme?.[theme] || itemConfig.color;
      return color ? `--color-${key}: ${color};` : null;
    })
    .filter(Boolean)
    .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ResponsiveContainer> & {
    config: ChartConfig;
    id?: string;
    children: React.ReactNode;
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config, activeConfig: {} }}>
      <ResponsiveContainer
        id={chartId}
        ref={ref}
        className={cn(
          "flex h-96 w-full flex-col items-center justify-center [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-dot]:fill-primary [&_.recharts-active-dot]:fill-background [&_.recharts-active-dot]:stroke-primary [&_.recharts-tooltip-cursor]:fill-accent [&_.recharts-brush-bg]:fill-border [&_.recharts-brush-slider]:stroke-border [&_.recharts-brush-thumb]:fill-background [&_.recharts-brush-thumb]:stroke-primary [&_.recharts-reference-line-line]:stroke-border [&_.recharts-sector]:stroke-background [&_.recharts-sector]:fill-icon [&_.recharts-surface]:fill-background [&_.recharts-tooltip-wrapper_.recharts-tooltip-item]:text-foreground",
          className,
        )}
        {...props}
      >
        {children}
      </ResponsiveContainer>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = ({
  cursor = false,
  content,
  className,
  ...props
}: React.ComponentProps<typeof Tooltip> & {
  className?: string;
}) => {
  const { activeConfig } = useChart();

  return (
    <Tooltip
      cursor={cursor}
      content={({ active, payload, label }) => {
        if (active && payload && payload.length) {
          return (
            <div
              className={cn(
                "grid min-w-[130px] items-start text-xs border border-border bg-background p-2 shadow-md",
                className,
              )}
            >
              {typeof content === 'function' ? ( // Type guard to check if content is a function
                content({ active, payload, label })
              ) : (
                <>
                  {label && (
                    <div className="border-b border-border pb-2 text-muted-foreground">
                      {label}
                    </div>
                  )}
                  <div className="grid gap-1 pt-2">
                    {payload.map((item, index) => {
                      const key = item.dataKey as keyof typeof activeConfig;
                      const config = key ? activeConfig[key] : undefined;

                      return (
                        <div
                          key={item.dataKey as React.Key}
                          className="flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "flex h-3 w-3 shrink-0 rounded-full",
                                item.color && `bg-[${item.color}]`,
                              )}
                              style={{
                                backgroundColor: item.color,
                              }}
                            />
                            {config?.label || item.name}:
                          </div>
                          <span className="font-mono font-medium text-foreground">
                            {item.value as React.ReactNode}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        }

        return null;
      }}
      wrapperStyle={{ outline: "none" }}
      {...props}
    />
  );
};

const ChartLegend = ({
  className,
  hideIcon = false,
  formatter,
  ...props
}: Omit<React.ComponentProps<typeof Legend>, 'ref'> & { // Omit ref from props
  className?: string;
  hideIcon?: boolean;
}) => {
  const { activeConfig } = useChart();

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-4", className)}>
      <Legend
        formatter={(value, entry, index) => {
          const key = entry.dataKey as keyof typeof activeConfig;
          const config = key ? activeConfig[key] : undefined;
          return (
            <div className="flex items-center gap-2">
              {!hideIcon && (
                <span
                  className={cn(
                    "flex h-3 w-3 shrink-0 rounded-full",
                    entry.color && `bg-[${entry.color}]`,
                  )}
                  style={{
                    backgroundColor: entry.color,
                  }}
                />
              )}
              {config?.label || value}
            </div>
          );
        }}
        wrapperStyle={{ outline: "none" }}
        {...props}
      />
    </div>
  );
};

const ChartCrosshair = ({
  className,
  ...props
}: React.ComponentProps<typeof CartesianGrid>) => {
  return (
    <CartesianGrid
      vertical={false}
      stroke="hsl(var(--chart-foreground))"
      strokeOpacity={0.15}
      strokeDasharray="4 4"
      className={cn("pointer-events-none", className)}
      {...props}
    />
  );
};
ChartCrosshair.displayName = "ChartCrosshair";

const ChartDot = ({
  className,
  ...props
}: React.ComponentProps<typeof Dot>) => {
  return (
    <Dot
      r={6}
      fill="hsl(var(--background))"
      stroke="hsl(var(--chart-foreground))"
      strokeWidth={2}
      className={cn("drop-shadow-xl", className)}
      {...props}
    />
  );
};
ChartDot.displayName = "ChartDot";

const ChartGrid = ({
  className,
  ...props
}: React.ComponentProps<typeof CartesianGrid>) => {
  return (
    <CartesianGrid
      vertical={false}
      stroke="hsl(var(--chart-foreground))"
      strokeOpacity={0.15}
      strokeDasharray="4 4"
      className={cn("pointer-events-none", className)}
      {...props}
    />
  );
};
ChartGrid.displayName = "ChartGrid";

const ChartAxis = ({
  className,
  orientation,
  ...props
}: React.ComponentProps<typeof XAxis> & React.ComponentProps<typeof YAxis>) => {
  const AxisComponent: React.ComponentType<any> = (orientation === 'left' || orientation === 'right') ? YAxis : XAxis;

  return (
    <AxisComponent
      axisLine={false}
      tickLine={false}
      className={cn("text-sm text-muted-foreground", className)}
      orientation={orientation}
      {...props}
    />
  );
};
ChartAxis.displayName = "ChartAxis";

const ChartTooltipProvider = ChartContext.Provider;

const ChartTooltipContentProvider = ChartContext.Provider;

const ChartLegendContentProvider = ChartContext.Provider;

const ChartCrosshairProvider = ChartContext.Provider;

const ChartDotProvider = ChartContext.Provider;

const ChartGridProvider = ChartContext.Provider;

const ChartAxisProvider = ChartContext.Provider;

export {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartCrosshair,
  ChartDot,
  ChartGrid,
  ChartAxis,
  ChartTooltipProvider,
  ChartTooltipContentProvider,
  ChartLegendContentProvider,
  ChartCrosshairProvider,
  ChartDotProvider,
  ChartGridProvider,
  ChartAxisProvider,
  LineChart,
  BarChart,
  AreaChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
};