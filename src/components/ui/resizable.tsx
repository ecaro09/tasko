"use client";

import {
  Panel as ResizablePanel,
  PanelGroup as ResizablePanelGroup,
  PanelResizeHandle, // Import the original component directly
} from "react-resizable-panels";

import { cn } from "@/lib/utils";
import * as React from "react";

// Use ComponentPropsWithoutRef as 'ref' is passed separately by forwardRef
type ResizableHandleProps = React.ComponentPropsWithoutRef<typeof PanelResizeHandle> & {
  withHandle?: boolean; // Custom prop
};

const ResizableHandle = React.forwardRef<
  React.ElementRef<typeof PanelResizeHandle>, // Reference the original component here
  ResizableHandleProps
>(({ className, withHandle, ...props }, forwardedRef) => (
  <PanelResizeHandle // Use the original component here
    ref={forwardedRef} // This should now correctly pass the ref
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0",
      className
    )}
    {...props} // Spread the rest of the props (which should not contain 'ref')
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <svg
          className="h-2.5 w-2.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 12h8" />
          <path d="M12 8v8" />
        </svg>
      </div>
    )}
  </ResizablePanelHandle>
));

ResizableHandle.displayName = "ResizableHandle";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };