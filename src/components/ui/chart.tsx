"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  Tooltip as _RechartsTooltip,
  TooltipProps as _RechartsTooltipProps,
  Legend as _RechartsLegend,
  LegendProps as _RechartsLegendProps,
} from "recharts";
import { cn } from "@/lib/utils";

// --- ChartConfig Type ---
type ChartConfig = {
  [k: string]: {
    label?: string;
    color?: string;
    icon?: React.ComponentType<{ className?: string }>;
  };
};

// --- ChartContext ---
type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a ChartProvider");
  }
  return context;
}

// --- ChartContainer ---
interface ChartContainerProps extends React.ComponentPropsWithoutRef<typeof ResponsiveContainer> {
  config: ChartConfig;
  children: React.ReactElement;
}

const ChartContainer = React.forwardRef<
  React.ElementRef<typeof ResponsiveContainer>,
  ChartContainerProps
>(({ config, className, children, ...props }, ref) => (
  <ChartContext.Provider value={{ config }}>
    <ResponsiveContainer
      ref={ref}
      className={cn("h-[300px] w-full", className)}
      {...props}
    >
      {children}
    </ResponsiveContainer>
  </ChartContext.Provider>
));
ChartContainer.displayName = "ChartContainer";

// --- ChartTooltip ---
// Fix for error #1: Add className to ChartTooltipProps
interface ChartTooltipProps extends _RechartsTooltipProps<any, any> {
  className?: string; // Explicitly add className for the wrapper
}

const ChartTooltip = React.forwardRef<
  React.ElementRef<typeof _RechartsTooltip>,
  ChartTooltipProps
>(({ className, ...props }, ref) => (
  <_RechartsTooltip
    ref={ref}
    wrapperClassName={cn("!bg-card !text-card-foreground", className)}
    {...props}
  />
));
ChartTooltip.displayName = "ChartTooltip";


// --- ChartTooltipContent ---
interface ChartTooltipContentProps {
  active?: boolean;
  payload?: _RechartsTooltipProps<any, any>["payload"];
  label?: _RechartsTooltipProps<any, any>["label"];
  formatter?: (value: any, name: any, props: any, index: number) => React.ReactNode;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  className?: string;
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(({ active, payload, className, formatter, hideLabel = false, hideIndicator = false, ...props }, ref) => {
  const { config } = useChart();

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const defaultFormatter = (value: any, name: any, item: any, index: number) => {
    const unit = item?.unit;
    if (unit) {
      return `${value} ${unit}`;
    }
    return value;
  };

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[130px] items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
      {...props}
    >
      {!hideLabel && payload[0]?.name && (
        <div className="text-muted-foreground">{payload[0].name}</div>
      )}
      {payload.map((item, index) => {
        const key = item.dataKey || item.name;
        const itemConfig = key ? config[key] : undefined;
        const indicatorColor = itemConfig?.color || item.color;

        return (
          <div
            key={item.dataKey || `item-${index}`}
            className="flex w-full items-stretch gap-2"
          >
            {!hideIndicator && (
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: indicatorColor,
                }}
              />
            )}
            <div className="flex flex-1 justify-between">
              <div className="text-muted-foreground">
                {itemConfig?.label || item.name}
              </div>
              <div className="font-mono font-medium tabular-nums text-foreground">
                {(formatter || defaultFormatter)(item.value, item.name!, item, index)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";

// --- ChartLegend ---
interface ChartLegendProps {
  payload?: _RechartsLegendProps['payload'];
  layout?: _RechartsLegendProps['layout'];
  align?: _RechartsLegendProps['align'];
  verticalAlign?: _RechartsLegendProps['verticalAlign'];
  hideIcon?: boolean;
  className?: string;
}

const ChartLegend = ({ className, payload, hideIcon = false, verticalAlign, ...props }: ChartLegendProps) => {
  const { config } = useChart();

  if (!payload || payload.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" && "pb-3",
        verticalAlign === "bottom" && "pt-3",
        className
      )}
      {...props}
    >
      {payload.map((item) => {
        const key = item.dataKey || item.value;
        const itemConfig = key ? config[key] : undefined;
        const indicatorColor = itemConfig?.color || item.color;

        if (!item || hideIcon) {
          return null;
        }

        return (
          <div
            key={item.value}
            className="flex items-center gap-1.5"
          >
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: indicatorColor,
              }}
            />
            <div className="text-xs text-muted-foreground">
              {itemConfig?.label || item.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};
ChartLegend.displayName = "ChartLegend";

// --- ChartLegendContent ---
// Fix for error #2: Explicitly type props with _RechartsLegendProps<any, any>
const ChartLegendContent = (props: _RechartsLegendProps<any, any>) => {
  return <_RechartsLegend content={ChartLegend} {...props} />;
};
ChartLegendContent.displayName = "ChartLegendContent";


// --- Exports ---
export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
};