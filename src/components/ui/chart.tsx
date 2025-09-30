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
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  type TooltipProps,
  type LegendProps,
} from "recharts";
import {
  ChartContainer as RechartsChartContainer,
  ChartTooltip as RechartsChartTooltip,
  ChartTooltipContent as RechartsChartTooltipContent,
  type ChartConfig as RechartsChartConfig,
} from "@/components/ui/chart"; // This import is causing circular dependency. We will define them here.
import { cn } from "@/lib/utils";

// Define ChartConfig locally to avoid circular dependency
export type ChartConfig = {
  [key: string]: {
    label?: string;
    color?: string;
    icon?: React.ComponentType<{ className?: string }>;
    theme?: Record<string, string>;
  };
};

const THEMES = {
  light: "",
  dark: ".dark",
} as const;

type ChartContextProps = {
  config: ChartConfig;
  theme: keyof typeof THEMES;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

export function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(
    ([_, itemConfig]) => (itemConfig as ChartConfig[string]).theme || (itemConfig as ChartConfig[string]).color,
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
      const typedItemConfig = itemConfig as ChartConfig[string];
      const color = typedItemConfig.theme?.[theme as keyof typeof typedItemConfig.theme] || typedItemConfig.color;
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

type ChartContainerProps = React.ComponentProps<typeof RechartsChartContainer> & {
  config: ChartConfig;
};

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  ChartContainerProps
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config, theme: "light" }}> {/* Default theme to light */}
      <RechartsChartContainer
        ref={ref}
        id={chartId}
        className={cn(
          "flex h-[300px] w-full flex-col items-center justify-center",
          className,
        )}
        {...props}
      >
        {children}
      </RechartsChartContainer>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

type ChartTooltipProps = TooltipProps<any, any> & {
  content?: React.ComponentProps<typeof RechartsChartTooltipContent>["content"];
};

const ChartTooltip = ({ content, ...props }: ChartTooltipProps) => {
  const { config } = useChart();
  return (
    <Tooltip
      cursor={false}
      content={({ active, payload, label }) => (
        <RechartsChartTooltipContent
          active={active}
          payload={payload}
          label={label}
          config={config}
          content={content}
        />
      )}
      {...props}
    />
  );
};
ChartTooltip.displayName = "ChartTooltip";

type ChartTooltipContentProps = React.ComponentProps<typeof RechartsChartTooltipContent>;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(({ className, ...props }, ref) => {
  return <RechartsChartTooltipContent ref={ref} className={cn(className)} {...props} />;
});
ChartTooltipContent.displayName = "ChartTooltipContent";


type ChartLegendProps = React.ComponentProps<"div"> &
  Pick<LegendProps, "payload" | "verticalAlign"> & {
    hideIcon?: boolean;
  };

const ChartLegend = ({
  className,
  payload,
  hideIcon = false,
  verticalAlign = "bottom",
  ...props
}: ChartLegendProps) => {
  const { config } = useChart(); // Access config from context

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
      {...props}
    >
      {payload.map((item: any) => {
        const activeColor = item.color || config[item.dataKey]?.color;
        return (
          <div
            key={item.value}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            {!hideIcon && (
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{
                  backgroundColor: `hsl(${activeColor})`,
                }}
              />
            )}
            {item.value}
          </div>
        );
      })}
    </div>
  );
};

const ChartLegendContent = (props: LegendProps) => {
  return <Legend content={ChartLegend} {...props} />; // Pass ChartLegend as component reference
};

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  // Re-export Recharts components for convenience
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  LineChart,
  Bar,
  BarChart,
  Area,
  AreaChart,
};