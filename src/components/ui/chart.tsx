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
  type TooltipProps,
  type LegendProps,
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

// Extend Recharts Payload type to include 'inactive'
interface ExtendedPayload extends Payload<ValueType, NameType> {
  inactive?: boolean;
}

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

// ChartTooltipContent
interface ChartTooltipContentProps extends TooltipProps<ValueType, NameType> {
  className?: string; // Custom prop for styling the shadcn/ui TooltipContent wrapper
  customContent?: React.ReactNode | ((props: TooltipProps<ValueType, NameType>) => React.ReactNode);
  payload?: ExtendedPayload[]; // Use ExtendedPayload
  formatter?: TooltipProps<ValueType, NameType>['formatter']; // Explicitly use Recharts' formatter type
}

const ChartTooltipContent = ({
  active,
  payload,
  label,
  className,
  formatter,
  customContent,
  ...props
}: ChartTooltipContentProps) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <TooltipPrimitiveContent
      className={cn(
        "z-50 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
    >
      {typeof customContent === 'function' ? (
        customContent({ active, payload, label, formatter, ...props })
      ) : customContent ? (
        customContent
      ) : (
        <div className="grid gap-1">
          <p className="text-sm font-bold">{label}</p>
          {payload.map((entry, i) => (
            <div key={`item-${i}`} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{entry.name}</span>
              <span
                className="text-sm font-bold"
                style={{ color: entry.color }}
              >
                {/* This formatter call is correct for TooltipProps['formatter'] (4 arguments) */}
                {formatter ? formatter(entry.value, entry.name, entry, i) : entry.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </TooltipPrimitiveContent>
  );
};
ChartTooltipContent.displayName = "ChartTooltipContent";


// ChartLegendContent
interface ChartLegendContentProps {
  className?: string; // Custom prop for styling the ul wrapper inside content
  formatter?: (value: ValueType, entry: ExtendedPayload, index: number) => React.ReactNode; // Corrected formatter signature (3 arguments)
  payload?: ExtendedPayload[]; // Use ExtendedPayload
}

const ChartLegendContent = ({ className, formatter, payload }: ChartLegendContentProps) => (
  <ul // This ul should only receive HTML ul attributes
    className={cn(
      "flex flex-wrap items-center justify-center gap-2",
      className
    )}
  >
    {payload?.map((entry, index) => {
      if (entry.inactive) return null; // Now 'inactive' exists on ExtendedPayload
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
          {/* Corrected call for Legend formatter (3 arguments) */}
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
ChartLegendContent.displayName = "ChartLegendContent";


// Chart
type ChartProps = React.ComponentProps<typeof ChartContainer> & {
  children: React.ReactNode;
};

function Chart({
  data,
  categories,
  minValue,
  maxValue,
  className,
  children,
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
      {children}
    </ChartContainer>
  );
}

// Export components
export {
  Chart,
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
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
  Legend,
};