"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  Area,
  AreaChart,
  Scatter,
  ScatterChart,
  ComposedChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import type {
  ContentProps as RechartsTooltipContentProps,
  TooltipProps,
  LegendProps,
} from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

import { cn } from "@/lib/utils";

// Derive Payload types from RechartsProps
type RechartsTooltipPayload = TooltipProps<ValueType, NameType>["payload"][number];
type RechartsLegendPayload = LegendProps["payload"][number];

const ChartContext = React.createContext<ChartContextProps | undefined>(
  undefined
);

interface ChartContextProps {
  config: ChartConfig;
  id: string;
}

type ChartConfig = {
  [k: string]: {
    label?: string;
    color?: string;
    icon?: React.ComponentType<{ className?: string }>;
    formatter?: (
      value: ValueType,
      name: NameType,
      item: RechartsTooltipPayload,
      index: number,
      payload: RechartsTooltipPayload[]
    ) => React.ReactNode;
  };
};

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
}

const Chart = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & ChartProps
>(({ config, className, children, ...props }, ref) => {
  const id = React.useId();
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <ChartContext.Provider value={{ config, id }}>
      <div
        ref={ref}
        className={cn("h-[400px] w-full", className)}
        {...props}
      >
        <ResponsiveContainer>
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
Chart.displayName = "Chart";

const ChartTooltip = ({
  cursor = false,
  content,
  ...props
}: React.ComponentProps<typeof Tooltip>) => {
  const { id, config } = React.useContext(ChartContext) as ChartContextProps;

  return (
    <Tooltip
      filterNull={true}
      cursor={cursor}
      content={content || (<ChartTooltipContent config={config} />)}
      {...props}
    />
  );
};
ChartTooltip.displayName = "ChartTooltip";

interface ChartTooltipContentProps
  extends RechartsTooltipContentProps<ValueType, NameType>,
    React.HTMLAttributes<HTMLDivElement> {
  hideLabel?: boolean;
  hideIndicator?: boolean;
  formatter?: TooltipProps<ValueType, NameType>["formatter"];
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(
  (
    {
      className,
      content,
      formatter,
      hideLabel = false,
      hideIndicator = false,
      labelClassName,
      wrapperClassName,
      cursor,
      ...props
    },
    ref
  ) => {
    const { id, config } = React.useContext(ChartContext) as ChartContextProps;

    const formattedPayload = props.payload?.map((item) => {
      const key = item.dataKey as keyof typeof config;
      const itemConfig = config[key];
      return {
        ...item,
        color: itemConfig?.color || item.color,
        formatter: itemConfig?.formatter || formatter,
      };
    });

    return props.active && formattedPayload && formattedPayload.length ? (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[128px] items-center rounded-md border border-border bg-white/95 px-2.5 py-1.5 text-xs shadow-xl backdrop-blur-sm",
          className
        )}
      >
        {!hideLabel ? (
          <div className="border-b border-border pb-1 text-muted-foreground">
            <span className={labelClassName}>{props.label}</span>
          </div>
        ) : null}
        <div className="grid gap-1 pt-2">
          {formattedPayload.map((item, index) => (
            <div
              key={item.dataKey}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                {!hideIndicator ? (
                  <span
                    className="flex h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                ) : null}
                <span className="text-muted-foreground">
                  {item.name}
                </span>
              </div>
              <span className="font-medium text-foreground">
                {item.formatter
                  ? item.formatter(item.value, item.name, item, index, formattedPayload)
                  : item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    ) : null;
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    LegendProps & {
      hideIndicator?: boolean;
      formatter?: LegendProps["formatter"];
    }
>(
  (
    {
      className,
      content,
      formatter,
      hideIndicator = false,
      ...props
    },
    ref
  ) => {
    const { id, config } = React.useContext(ChartContext) as ChartContextProps;

    return (
      <Legend
        {...props}
        content={({ payload }) => {
          const formattedPayload = payload?.map((item) => {
            const key = item.dataKey as keyof typeof config;
            const itemConfig = config[key];
            return {
              ...item,
              color: itemConfig?.color || item.color,
              formatter: itemConfig?.formatter || formatter,
            };
          });

          return formattedPayload && formattedPayload.length ? (
            <div
              ref={ref}
              className={cn(
                "flex flex-wrap items-center gap-2",
                className
              )}
            >
              {formattedPayload.map((item, index) => (
                <div
                  key={item.value}
                  className={cn(
                    "flex items-center gap-1",
                    item.inactive && "text-muted-foreground"
                  )}
                >
                  {!hideIndicator ? (
                    <span
                      className="flex h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  ) : null}
                  {item.formatter
                    ? item.formatter(item.value, item.name, item, index)
                    : item.name}
                </div>
              ))}
            </div>
          ) : null;
        }}
      />
    );
  }
);
ChartLegend.displayName = "ChartLegend";

export {
  Chart,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
};