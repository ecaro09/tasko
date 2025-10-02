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
  ContentProps,
  Payload,
} from "recharts/types/component/DefaultTooltipContent";
import { cn } from "@/lib/utils";

const ChartContext = React.createContext<ChartContextProps | null>(null);

type ChartContextProps = {
  config: ChartConfig;
  /**
   * The currently active main color for the chart.
   */
  activeConfig: ChartConfig[keyof ChartConfig];
};

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

type ChartContainerProps = React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ReactNode;
};

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  ChartContainerProps
>(({ config, className, children, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config, activeConfig: {} }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-foreground",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {children}
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color,
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
    .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = ({
  className,
  content,
  ...props
}: React.ComponentProps<typeof Tooltip> & {
  content?: React.ComponentProps<typeof ChartTooltipContent>["content"];
}) => {
  const { activeConfig } = useChart();

  return (
    <Tooltip
      cursor={{ stroke: "hsl(var(--chart-foreground))", strokeOpacity: 0.15 }}
      wrapperStyle={{ outline: "none" }}
      content={({ active, payload, label }) => (
        <ChartTooltipContent
          active={active}
          payload={payload}
          label={label}
          content={content}
          activeConfig={activeConfig}
        />
      )}
      className={className}
      {...props}
    />
  );
};

type ChartTooltipContentProps = ContentProps<any, any> & {
  activeConfig: ChartContextProps["activeConfig"];
  content?: React.ComponentProps<typeof ChartTooltipContent>["content"];
};

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(
  (
    { active, payload, content, activeConfig, className, ...props },
    ref,
  ) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    const defaultContent = (
      <div
        className={cn(
          "grid min-w-[130px] gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-xl",
          className,
        )}
        {...props}
      >
        <p className="text-muted-foreground">{payload[0].name}</p>
        {payload.map((item, index) => {
          const activeColor = activeConfig?.[item.dataKey as keyof typeof activeConfig]?.color;
          return (
            <div
              key={item.dataKey}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <span
                  className="mr-2 h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: activeColor || item.color,
                  }}
                />
                {item.name}
              </div>
              {item.value}
            </div>
          );
        })}
      </div>
    );

    return (
      <div ref={ref}>
        {content ? content({ active, payload, label: payload[0].name }) : defaultContent}
      </div>
    );
  },
);
ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartLegend = ({
  className,
  content,
  ...props
}: React.ComponentProps<typeof Legend> & {
  content?: React.ComponentProps<typeof ChartLegendContent>["content"];
}) => {
  const { activeConfig } = useChart();

  return (
    <Legend
      content={({ payload }) => (
        <ChartLegendContent
          payload={payload}
          content={content}
          activeConfig={activeConfig}
        />
      )}
      className={className}
      {...props}
    />
  );
};

type ChartLegendContentProps = React.ComponentProps<"div"> &
  Pick<React.ComponentProps<typeof Legend>, "payload" | "verticalAlign"> & {
    activeConfig: ChartContextProps["activeConfig"];
    content?: (props: { payload?: Payload[] }) => React.ReactNode;
    hideIcon?: boolean;
  };

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  ChartLegendContentProps
>(
  (
    { payload, content, activeConfig, className, hideIcon = false, ...props },
    ref,
  ) => {
    if (!payload || !payload.length) {
      return null;
    }

    const defaultContent = (
      <div
        ref={ref}
        className={cn(
          "flex flex-wrap items-center justify-center gap-4",
          className,
        )}
        {...props}
      >
        {payload.map((item) => {
          const activeColor = activeConfig?.[item.dataKey as keyof typeof activeConfig]?.color;
          return (
            <div
              key={item.dataKey}
              className="flex items-center gap-1.5"
            >
              {!hideIcon && (
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: activeColor || item.color,
                  }}
                />
              )}
              {item.value}
            </div>
          );
        })}
      </div>
    );

    return <div ref={ref}>{content ? content({ payload }) : defaultContent}</div>;
  },
);
ChartLegendContent.displayName = "ChartLegendContent";

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
  ...props
}: React.ComponentProps<typeof XAxis> | React.ComponentProps<typeof YAxis>) => {
  return (
    <XAxis
      axisLine={false}
      tickLine={false}
      className={cn("text-sm text-muted-foreground", className)}
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

const THEMES = {
  light: "[data-theme=light]",
  dark: "[data-theme=dark]",
} as const;

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