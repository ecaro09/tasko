"use client";

import {
  Panel as ResizablePanel,
  PanelGroup as ResizablePanelGroup,
  PanelResizeHandle as OriginalPanelResizeHandle, // Alias the original import
} from "react-resizable-panels";

import { cn } from "@/lib/utils";
import * as React from "react";

// Explicitly define the type for PanelResizeHandle to ensure it includes ref
type PanelResizeHandleType = React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof OriginalPanelResizeHandle> & React.RefAttributes<HTMLDivElement>
>;

// Cast the original component to our new type
const PanelResizeHandle: PanelResizeHandleType = OriginalPanelResizeHandle;

// Define props for our wrapper component, excluding 'ref' as it's handled by forwardRef
interface ResizableHandleComponentProps extends React.ComponentPropsWithoutRef<typeof PanelResizeHandle> {
  withHandle?: boolean;
}

const ResizableHandle = React.forwardRef<
  HTMLDivElement, // Explicitly define the type of the forwarded ref (HTMLDivElement for PanelResizeHandle)
  ResizableHandleComponentProps
>(({ className, withHandle, ...props }, forwardedRef) => (
  <PanelResizeHandle
    ref={forwardedRef} // This should now correctly pass the ref
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0",
      className
    )}
    {...props}
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
  </PanelResizeHandle>
));

ResizableHandle.displayName = "ResizableHandle";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };