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
import type {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

import { cn } from "@/lib/utils";

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  customRender?: React.ReactNode | ((props: TooltipProps<ValueType, NameType>) => React.ReactNode);
  className?: string;
}

// Custom Tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
  customRender, // Renamed to avoid conflict with recharts' internal 'content'
  className,
  ...props
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={cn(
          "rounded-lg border bg-background p-2 shadow-sm",
          className
        )}
        {...props}
      >
        <p className="text-sm font-bold">{label}</p>
        {payload.map((entry, i) => (
          <div key={`item-${i}`} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{entry.name}</span>
            <span
              className="text-sm font-bold"
              style={{ color: entry.color }}
            >
              {entry.value}
            </span>
          </div>
        ))}
        {customRender && (
          <div className="mt-2 border-t pt-2 text-sm text-muted-foreground">
            {typeof customRender === "function" ? customRender({ active, payload, label }) : customRender}
          </div>
        )}
      </div>
    );
  }

  return null;
};

// Custom Legend component
const ChartLegend = React.forwardRef<
  HTMLDivElement, // Ref for the outer div
  LegendProps & { className?: string }
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground p-2 rounded-md bg-background shadow-sm",
        className
      )}
    >
      <Legend
        formatter={(value, entry) => (
          <span className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {value}
          </span>
        )}
        {...props}
      />
    </div>
  );
});
ChartLegend.displayName = "ChartLegend";

interface ChartProps extends React.ComponentProps<typeof ResponsiveContainer> {
  data: Record<string, any>[];
  type: "line" | "bar" | "area";
  categories: {
    key: string;
    name: string;
    color: string;
    type?: "line" | "bar" | "area";
  }[];
  index: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  tooltipContent?: React.ReactNode | ((props: TooltipProps<ValueType, NameType>) => React.ReactNode);
  legend?: boolean;
  className?: string;
}

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  (
    {
      data,
      type,
      categories,
      index,
      yAxisLabel,
      xAxisLabel,
      tooltipContent,
      legend = true,
      className,
      ...props
    },
    ref
  ) => {
    const ChartComponent: React.ComponentType<any> =
      type === "line"
        ? LineChart
        : type === "bar"
        ? BarChart
        : AreaChart;
    const ItemComponent: React.ComponentType<any> =
      type === "line" ? Line : type === "bar" ? Bar : Area;

    return (
      <div ref={ref} className={cn("h-[400px] w-full", className)}>
        <ResponsiveContainer {...props}>
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey={index}
              label={{ value: xAxisLabel, position: "insideBottom", offset: 0 }}
              className="fill-foreground text-sm"
            />
            <YAxis
              label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }}
              className="fill-foreground text-sm"
            />
            <Tooltip
              content={(tooltipProps) => <CustomTooltip {...tooltipProps} customRender={tooltipContent} />}
              wrapperStyle={{ outline: "none" }}
            />
            {legend && <ChartLegend />}
            {categories.map((category) => (
              <ItemComponent
                key={category.key}
                dataKey={category.key}
                name={category.name}
                stroke={category.color}
                fill={category.color}
                type={category.type || "monotone"}
              />
            ))}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    );
  }
);
Chart.displayName = "Chart";

export { Chart };