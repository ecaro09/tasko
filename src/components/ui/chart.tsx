"use client";

import * as React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Bar,
  BarChart,
  Area,
  AreaChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  Tooltip,
  type TooltipProps, // Import TooltipProps directly
  type LegendProps, // Import LegendProps directly
} from "recharts";
import type {
  Payload,
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

import { cn } from "@/lib/utils";
import {
  TooltipContent as TooltipPrimitiveContent,
} from "@/components/ui/tooltip";

// ChartContext
type ChartContextProps = {
  data: Record<string, any>[];
  categories: string[];
  minValue?: number;
  maxValue?: number;
};

const ChartContext = React.createContext<ChartContextProps>({
  data: [],
  categories: [],
});

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <Chart />");
  }
  return context;
}

// ChartContainer
type ChartContainerProps = React.ComponentProps<typeof ResponsiveContainer> &
  ChartContextProps & {
    className?: string;
    children: React.ReactNode;
  };

function ChartContainer({
  data,
  categories,
  minValue,
  maxValue,
  className,
  children,
  ...props
}: ChartContainerProps) {
  const chartConfig = React.useMemo(
    () => ({ data, categories, minValue, maxValue }),
    [data, categories, minValue, maxValue],
  );

  return (
    <ChartContext.Provider value={chartConfig}>
      <div className={cn("h-[400px] w-full", className)}>
        <ResponsiveContainer {...props}>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

// ChartTooltip
interface ChartTooltipProps extends TooltipProps<ValueType, NameType> { // Extend Recharts TooltipProps
  className?: string; // Custom prop for styling the shadcn/ui TooltipContent wrapper
}

const ChartTooltip = ({
  active,
  payload,
  content,
  className,
  formatter, // Destructure formatter here
  label, // Destructure label for custom content rendering
  ...props
}: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  const valueFormatter = formatter; // Use the destructured formatter

  return (
    <TooltipPrimitiveContent
      className={cn(
        "z-50 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
    >
      {typeof content === 'function' ? (
        content({ active, payload, label, formatter, ...props }) // Call content function if it's a function
      ) : content ? (
        content // Render directly if it's a ReactNode
      ) : (
        <div className="grid gap-1">
          <div className="flex items-center justify-between gap-4">
            <p className="text-muted-foreground text-xs">{data.name}</p>
            <p className="font-semibold text-xs">
              {valueFormatter ? valueFormatter(data.value, data.name, payload[0], 0) : data.value}
            </p>
          </div>
        </div>
      )}
    </TooltipPrimitiveContent>
  );
};

// ChartLegend
const ChartLegend = React.forwardRef<
  React.ElementRef<typeof Legend>,
  LegendProps & { // Extend Recharts LegendProps
    className?: string; // Custom prop for styling the ul wrapper inside content
  }
>(({ className, formatter, ...props }, ref) => (
  <Legend
    ref={ref as any} // Cast ref to any as a workaround for Recharts type incompatibility
    content={({ payload }) => {
      return (
        <ul
          className={cn(
            "flex flex-wrap items-center justify-center gap-2",
            className
          )}
        >
          {payload?.map((entry, index) => {
            if (entry.inactive) return null;
            return (
              <li
                key={`item-${index}`}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{
                    backgroundColor: entry.color,
                  }}
                />
                {formatter ? (
                  formatter(entry.value, entry, index)
                ) : (
                  <span className="text-muted-foreground">{entry.value}</span>
                )}
              </li>
            );
          })}
        </ul>
      );
    }}
    {...props}
  />
));
ChartLegend.displayName = "ChartLegend"; // Add display name

// Chart
type ChartProps = React.ComponentProps<typeof ChartContainer> & {
  children: React.ReactNode;
  tooltipClassName?: string;
  legendClassName?: string;
};

function Chart({
  data,
  categories,
  minValue,
  maxValue,
  className,
  children,
  tooltipClassName,
  legendClassName,
  ...props
}: ChartProps) {
  return (
    <ChartContainer
      data={data}
      categories={categories}
      minValue={minValue}
      maxValue={maxValue}
      className={className}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === Tooltip) {
            return React.cloneElement(child as React.ReactElement<TooltipProps<ValueType, NameType>>, {
              content: (tooltipProps: TooltipProps<ValueType, NameType>) => (
                <ChartTooltip {...tooltipProps} className={tooltipClassName} />
              ),
              wrapperStyle: { outline: "none" }, // Ensure no outline on wrapper
            });
          }
          if (child.type === Legend) {
            return React.cloneElement(child as React.ReactElement<LegendProps>, {
              content: (legendProps: LegendProps) => (
                <ChartLegend {...legendProps} className={legendClassName} />
              ),
              wrapperStyle: { outline: "none" }, // Ensure no outline on wrapper
            });
          }
        }
        return child;
      })}
    </ChartContainer>
  );
}

// Export components
export {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
};