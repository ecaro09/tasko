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
} from "recharts";
import type {
  TooltipProps,
} from "recharts/types/component/Tooltip";
import type {
  Payload,
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import type {
  Props as LegendProps,
} from "recharts/types/component/Legend";

import {
  TooltipContent as TooltipPrimitiveContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

const ChartContext = React.createContext<
  Record<string, any> | null
>(null);

function Chart({
  config,
  children,
  className,
  ...props
}: React.ComponentProps<typeof ResponsiveContainer> & {
  config: ChartConfig;
}) {
  return (
    <ChartContext.Provider value={config}>
      <div className={cn("h-[400px] w-full", className)}>
        <ResponsiveContainer {...props}>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}
Chart.displayName = "Chart";

function ChartCrosshair({
  className,
  ...props
}: React.ComponentProps<typeof CartesianGrid>) {
  return (
    <CartesianGrid
      className={cn("stroke-border stroke-1", className)}
      vertical={false}
      {...props}
    />
  );
}
ChartCrosshair.displayName = "ChartCrosshair";

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Payload<ValueType, NameType>[];
  label?: string | number;
  className?: string;
  content?: React.ReactNode | ((props: TooltipProps<ValueType, NameType>) => React.ReactNode);
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps & React.ComponentPropsWithoutRef<typeof TooltipPrimitiveContent>
>(({ active, payload, label, content, className, ...props }, ref) => {
  if (!active || !payload || payload.length === 0) return null;

  const formattedPayload = payload.map((entry) => ({
    ...entry,
    color: entry.color || entry.payload?.fill || entry.stroke,
  }));

  return (
    <TooltipPrimitiveContent
      ref={ref}
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
        className
      )}
      {...props}
    >
      {content ? (
        typeof content === "function" ? (
          (content as (props: TooltipProps<ValueType, NameType>) => React.ReactNode)({ active, payload: formattedPayload, label })
        ) : (
          content
        )
      ) : (
        <div className="grid gap-1">
          <p className="text-sm font-medium">{label}</p>
          {formattedPayload.map((entry, index) => (
            <div
              key={`item-${index}`}
              className="flex items-center justify-between gap-4"
            >
              <span className="text-muted-foreground">{entry.name}</span>
              <span className="text-foreground" style={{ color: entry.color }}>
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </TooltipPrimitiveContent>
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> &
    LegendProps & {
      content?: React.ReactNode; // Use React.ReactNode for content
    }
>(({ className, content, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-wrap items-center justify-center gap-x-4",
      className
    )}
  >
    <Legend
      content={content}
      formatter={(value) => (
        <span className="text-muted-foreground">{value}</span>
      )}
      {...props}
    />
  </div>
));
ChartLegend.displayName = "ChartLegend";

export {
  Chart,
  ChartCrosshair,
  ChartTooltipContent,
  ChartLegend,
};