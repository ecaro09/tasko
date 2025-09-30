"use client";

import * as React from "react";
import {
  ChartContainer as RechartsChartContainer,
  ChartLegend as RechartsChartLegend,
  ChartLegendContent as RechartsChartLegendContent,
  ChartTooltip as RechartsChartTooltip,
  ChartTooltipContent as RechartsChartTooltipContent,
} from "recharts"; // These are the actual recharts components
import { cn } from "@/lib/utils";

// Define ChartConfig type locally as it's specific to this component's usage
export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<"light" | "dark", string> }
  );
};

interface ChartContextProps {
  config: ChartConfig;
  themes: Record<string, string>; // Add themes to context props
}

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsChartContainer> & {
    config: ChartConfig;
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  const themes = React.useMemo(() => {
    const colors: Record<string, string> = {};
    for (const [key, itemConfig] of Object.entries(config) as [string, ChartConfig[keyof ChartConfig]][]) {
      if (itemConfig.color) {
        colors[key] = itemConfig.color;
      } else if (itemConfig.theme) {
        colors[key] = `hsl(var(--color-${key}))`;
      }
    }
    return colors;
  }, [config]);

  return (
    <ChartContext.Provider value={{ config, themes }}>
      <RechartsChartContainer
        id={chartId}
        ref={ref}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-dot]:fill-primary [&_.recharts-active-dot]:fill-action [&_.recharts-tooltip-cursor]:fill-border [&_.recharts-tooltip-label]:font-bold [&_.recharts-tooltip-label]:text-foreground [&_.recharts-tooltip-item]:flex",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {children}
      </RechartsChartContainer>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

const THEMES = {
  light: "",
  dark: ".dark",
} as const;

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, itemConfig]) => itemConfig.theme || itemConfig.color,
  ) as [string, ChartConfig[keyof ChartConfig]][]; // Explicitly type itemConfig

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
      const color = itemConfig.theme?.[theme as keyof typeof THEMES] || itemConfig.color;
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
};

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsChartTooltip> & {
    hideIndicator?: boolean;
    hideContent?: boolean;
    formatter?: (
      value: number,
      name: string,
      props: { payload: Record<string, unknown> },
    ) => string;
  }
>(({ active, payload, formatter, hideContent, ...props }, ref) => {
  const { config } = useChart(); // Access config from context

  if (hideContent) {
    return null;
  }

  return (
    <RechartsChartTooltip
      active={active}
      payload={payload}
      formatter={formatter}
      {...props}
      contentStyle={{
        boxShadow: "none",
        borderRadius: "0.5rem",
        textAlign: "left",
      }}
      itemSorter={(item) => item.dataKey as string}
      wrapperClassName="!bg-card !text-card-foreground !border-border !text-sm !shadow-lg"
      content={({ active, payload, label }) => {
        if (active && payload && payload.length) {
          return (
            <div className="grid gap-1.5 p-2 text-xs">
              {label ? (
                <div className="flex items-center justify-between pb-2 text-xs">
                  <p className="text-muted-foreground">{label}</p>
                </div>
              ) : null}
              {payload.map((item, index) => {
                const key = item.dataKey as keyof typeof config;
                const itemConfig = config[key];
                if (!itemConfig) return null;
                return (
                  <div
                    key={item.dataKey}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-3 w-3 shrink-0 rounded-full"
                        style={{
                          backgroundColor: `hsl(var(--color-${item.dataKey}))`,
                        }}
                      />
                      {item.name}
                    </div>
                    <div className="font-medium text-foreground">
                      {item.value}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

        return null;
      }}
    />
  );
});
ChartTooltip.displayName = "ChartTooltip";

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsChartLegend> & {
    hideIcon?: boolean;
  }
>(({ className, hideIcon = false, ...props }, ref) => {
  const { config } = useChart(); // Access config from context

  return (
    <RechartsChartLegend
      ref={ref}
      {...props}
      content={({ payload }) => {
        if (!payload || !payload.length) {
          return null;
        }

        return (
          <div
            className={cn(
              "flex flex-wrap items-center justify-center gap-4",
              className,
            )}
          >
            {payload.map((item) => {
              const key = item.dataKey as keyof typeof config;
              const itemConfig = config[key];
              if (!itemConfig) return null;

              return (
                <div
                  key={item.value}
                  className="flex items-center gap-1.5"
                >
                  {!hideIcon && (
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{
                        backgroundColor: `hsl(var(--color-${item.dataKey}))`,
                      }}
                    />
                  )}
                  {item.value}
                </div>
              );
            })}
          </div>
        );
      }}
    />
  );
});
ChartLegend.displayName = "ChartLegend";

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsChartLegendContent>
>(({ ...props }, ref) => (
  <RechartsChartLegendContent
    ref={ref}
    formatter={(value, name, item) => {
      const key = item?.dataKey as string; // Use string for dataKey
      const theme = item?.payload?.theme as keyof typeof THEMES; // Type assertion for payload.theme
      return (
        <span
          className={cn(
            "inline-flex h-3 w-3 shrink-0 rounded-full",
            key && `bg-[--color-${key}]`,
          )}
        />
      );
    }}
    {...props}
  />
));
ChartLegendContent.displayName = "ChartLegendContent";

export {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};