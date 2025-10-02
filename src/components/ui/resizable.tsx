"use client";

import * as React from "react";
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
} from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof PanelGroup>) => (
  <PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
);

const ResizablePanel = Panel;

interface ResizableHandleProps extends React.ComponentPropsWithoutRef<typeof PanelResizeHandle> {
  withHandle?: boolean;
}

const ResizableHandle = React.forwardRef<
  React.ElementRef<typeof PanelResizeHandle>,
  ResizableHandleProps
>(({ className, withHandle, children, ...props }, ref) => (
  <PanelResizeHandle
    ref={ref}
    className={cn(
      "flex w-px items-center justify-center bg-border",
      withHandle &&
        "after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 after:bg-primary after:opacity-0 after:transition-all after:hover:opacity-100",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-2.5 w-2.5"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    )}
    {children}
  </PanelResizeHandle>
));
ResizableHandle.displayName = "ResizableHandle";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };