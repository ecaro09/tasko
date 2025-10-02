import * as React from "react";
import {
  type ChartConfig,
  ChartContainer as RechartsChartContainer,
  ChartLegend as RechartsChartLegend,
  type ChartLegendProps,
  ChartTooltip as RechartsChartTooltip,
  type ChartTooltipProps,
} from "@/components/ui/chart";
import {
  type ClassValue,
  clsx,
} from "clsx";
import {
  type AxisProps,
  type ContentRenderer,
  type LabelProps,
  type NameType,
  type ValueType,
} from "recharts";

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

const THEMES = {
  light: "",
  dark: ".dark",
} as const;

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
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
  React.ComponentProps<typeof RechartsChartContainer> & {
    config: ChartConfig;
    id?: string;
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config, activeConfig: {} }}>
      <ChartStyle id={chartId} config={config} />
      <RechartsChartContainer
        id={chartId}
        ref={ref}
        className={cn(
          "flex h-96 w-full flex-col items-center justify-center [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-dot]:fill-primary [&_.recharts-active-dot]:fill-background [&_.recharts-active-dot]:stroke-primary [&_.recharts-tooltip-cursor]:fill-accent [&_.recharts-brush-bg]:fill-border [&_.recharts-brush-slider]:stroke-border [&_.recharts-brush-thumb]:fill-background [&_.recharts-brush-thumb]:stroke-primary [&_.recharts-reference-line-line]:stroke-border [&_.recharts-sector]:stroke-background [&_.recharts-sector]:fill-icon [&_.recharts-surface]:fill-background [&_.recharts-tooltip-wrapper_.recharts-tooltip-item]:text-foreground",
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

const ChartTooltip = ({
  cursor = false,
  content,
  className,
  ...props
}: React.ComponentProps<typeof RechartsChartTooltip> & {
  content?: ContentRenderer<ValueType, NameType>;
}) => {
  const { activeConfig } = useChart();

  return (
    <RechartsChartTooltip
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
              {content ? (
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
                          key={item.dataKey}
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
                            {item.value}
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
      {...props}
    />
  );
};

const ChartLegend = ({
  className,
  hideIcon = false,
  formatter,
  ...props
}: React.ComponentProps<typeof RechartsChartLegend> & {
  hideIcon?: boolean;
}) => {
  const { activeConfig } = useChart();

  return (
    <RechartsChartLegend
      className={cn(
        "flex flex-wrap items-center justify-center gap-4",
        className,
      )}
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
      {...props}
    />
  );
};

const ChartCrosshair = ({
  className,
  ...props
}: React.ComponentProps<"div"> & {
  payload?: ChartTooltipProps["payload"];
}) => {
  const { activeConfig } = useChart();

  const payload =
    "payload" in props &&
    typeof props.payload === "object" &&
    props.payload !== null
      ? props.payload
      : undefined;

  if (!payload || !payload.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute inset-x-0 top-0 flex h-full items-center justify-center",
        className,
      )}
      {...props}
    >
      {payload.map((item, index) => {
        const key = item.dataKey as keyof typeof activeConfig;
        const config = key ? activeConfig[key] : undefined;

        return (
          <span
            key={item.dataKey}
            className={cn(
              "absolute h-full w-[1px] bg-border opacity-0 transition-opacity",
              config?.color && `bg-[--color-${key}]`,
            )}
            style={{
              left: `${item.payload.x}px`,
              opacity: item.payload.opacity,
            }}
          />
        );
      })}
    </div>
  );
};

const ChartGrid = ({
  className,
  ...props
}: React.ComponentProps<"div"> & {
  vertical?: boolean;
  horizontal?: boolean;
}) => {
  return (
    <div
      className={cn(
        "absolute inset-0 grid",
        props.vertical && "grid-cols-[repeat(var(--chart-cols),1fr)]",
        props.horizontal && "grid-rows-[repeat(var(--chart-rows),1fr)]",
        className,
      )}
      {...props}
    />
  );
};

const ChartAxis = ({
  className,
  ...props
}: React.ComponentProps<"div"> & {
  label?: string;
  orientation?: "left" | "right" | "top" | "bottom";
}) => {
  return (
    <div
      className={cn(
        "absolute text-xs text-muted-foreground",
        props.orientation === "left" &&
          "left-0 top-1/2 -translate-y-1/2 -rotate-90",
        props.orientation === "right" &&
          "right-0 top-1/2 -translate-y-1/2 rotate-90",
        props.orientation === "top" && "left-1/2 top-0 -translate-x-1/2",
        props.orientation === "bottom" && "left-1/2 bottom-0 -translate-x-1/2",
        className,
      )}
      {...props}
    >
      {props.label}
    </div>
  );
};

export {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartCrosshair,
  ChartGrid,
  ChartAxis,
};