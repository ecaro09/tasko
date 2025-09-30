"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  Tooltip as _RechartsTooltip,
  TooltipProps as _RechartsTooltipProps,
  Legend as _RechartsLegend,
  LegendProps as _RechartsLegendProps,
  // Removed direct imports of ValueType and NameType as they are not exported directly
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
  // Fix for error #3 and #4: ResponsiveContainer expects a single ReactElement child
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
// Fix for error #5: className is correctly part of _RechartsTooltipProps
interface ChartTooltipProps extends _RechartsTooltipProps<any, any> { // Use any for generics as ValueType/NameType are not directly imported
  // Add any custom props if needed
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
// Fix for error #6: This component is a custom content renderer,
// it receives specific props from Recharts, not all _RechartsTooltipProps.
interface ChartTooltipContentProps {
  active?: boolean;
  payload?: _RechartsTooltipProps<any, any>["payload"]; // Use any for generics
  label?: _RechartsTooltipProps<any, any>["label"]; // Use any for generics
  formatter?: _RechartsTooltipProps<any, any>["formatter"]; // Use any for generics
  hideLabel?: boolean;
  hideIndicator?: boolean;
  className?: string; // Explicitly add className for the wrapper div
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement, // Ref for the div element
  ChartTooltipContentProps
>(({ active, payload, className, formatter, hideLabel = false, hideIndicator = false, ...props }, ref) => {
  const { config } = useChart();

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  // Fix for error #6: Adjust defaultFormatter signature to match Recharts' expected formatter (4 arguments)
  const defaultFormatter = (value: any, name: any, item: any, index: number) => {
    const unit = item?.unit;
    if (unit) {
      return `${value} ${unit}`;
    }
    return value;
  };

  return (
    <div
      ref={ref} // Ref is for the div here
      className={cn(
        "grid min-w-[130px] items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className // Use the className passed to ChartTooltipContentProps
      )}
      {...props} // Pass any other div-specific props
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
                {(formatter || defaultFormatter)(item.value, item.name!, item, index)} {/* Pass all expected arguments */}
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
// Fix for error #7, #8, #9, #10: This component is a custom content renderer,
// it receives specific props from Recharts, not all _RechartsLegendProps.
interface ChartLegendProps {
  payload?: _RechartsLegendProps<any, any>["payload"]; // Use any for generics
  layout?: _RechartsLegendProps<any, any>["layout"]; // Use any for generics
  align?: _RechartsLegendProps<any, any>["align"]; // Use any for generics
  verticalAlign?: _RechartsLegendProps<any, any>["verticalAlign"]; // Use any for generics
  hideIcon?: boolean;
  className?: string; // Explicitly add className for the wrapper div
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
        className // Use the className passed to ChartLegendProps
      )}
      {...props} // Pass any other div-specific props
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
// Fix for error #11: _RechartsLegendProps is generic. Use any for generics.
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