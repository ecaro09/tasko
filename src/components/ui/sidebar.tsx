"use client";

import { VariantProps, cva } from "class-variance-authority";
import { PanelLeft } from "lucide-react";
import * as React from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar-state";
const SIDEBAR_COOKIE_MAX_AGE = 31536000; // 1 year
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextProps = {
  open: boolean;
  toggleSidebar: () => void;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
  defaultOpen = true,
  open: openProp,
  onOpenChange,
}) => {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(() => {
    if (typeof window === "undefined") {
      return defaultOpen;
    }
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
      ?.split("=")[1];
    return cookieValue ? cookieValue === "true" : defaultOpen;
  });
  const open = openProp ?? _open;

  const setOpen = React.useCallback(
    (openState: boolean) => {
      _setOpen(openState);
      onOpenChange?.(openState);
      if (typeof document !== "undefined") {
        // This sets the cookie to keep the sidebar state.
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      }
    },
    [onOpenChange],
  );

  const toggleSidebar = React.useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [toggleSidebar]);

  const contextValue = React.useMemo(
    () => ({
      open: isMobile ? openMobile : open,
      toggleSidebar,
      setOpen: isMobile ? setOpenMobile : setOpen,
      isMobile,
    }),
    [isMobile, openMobile, open, toggleSidebar, setOpen],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};

const sidebarVariants = cva(
  "group/sidebar h-full flex flex-col overflow-hidden border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
  {
    variants: {
      collapsed: {
        true: "w-14",
        false: "w-64",
      },
    },
    defaultVariants: {
      collapsed: false,
    },
  },
);

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  children?: React.ReactNode;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, collapsed, children, ...props }, ref) => {
    const { open, setOpen, isMobile } = useSidebar();

    if (isMobile) {
      return (
        <Sheet open={open} onOpenChange={setOpen} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className={cn(sidebarVariants({ collapsed: false }), className)}
            side="left"
            style={
              {
                "--sidebar-width": "16rem",
              } as React.CSSProperties
            }
          >
            {children}
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <aside
        ref={ref}
        data-sidebar="sidebar"
        className={cn(sidebarVariants({ collapsed }), className)}
        {...props}
      >
        {children}
      </aside>
    );
  },
);
Sidebar.displayName = "Sidebar";

const SidebarToggle = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, children, ...props }, ref) => {
  const { open, toggleSidebar, isMobile } = useSidebar();

  const button = (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        "absolute -right-4 top-1/2 z-20 h-8 w-8 -translate-y-1/2 rounded-full border bg-background",
        "group-hover/sidebar:flex",
        open === false ? "flex" : "hidden",
        isMobile && "hidden",
        className,
      )}
      onClick={toggleSidebar}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
    </Button>
  );

  if (isMobile) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right">Expand Sidebar</TooltipContent>
    </Tooltip>
  );
});
SidebarToggle.displayName = "SidebarToggle";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-14 items-center justify-center border-b px-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SidebarHeader.displayName = "SidebarHeader";

const SidebarHeaderTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-2 text-lg font-semibold",
        open === false ? "hidden" : "flex",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SidebarHeaderTitle.displayName = "SidebarHeaderTitle";

const SidebarMain = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-1 flex-col overflow-auto", className)}
      {...props}
    >
      {children}
    </div>
  );
});
SidebarMain.displayName = "SidebarMain";

const SidebarNav = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex flex-col gap-2 p-2", className)} {...props}>
      {children}
    </div>
  );
});
SidebarNav.displayName = "SidebarNav";

const SidebarNavHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "px-3 py-2 text-xs font-semibold uppercase text-muted-foreground",
        open === false ? "hidden" : "block",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SidebarNavHeader.displayName = "SidebarNavHeader";

const SidebarNavHeaderLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, children, ...props }, ref) => {
  const { open } = useSidebar();
  return (
    <a
      ref={ref}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        open === false ? "justify-center" : "justify-start",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
});
SidebarNavHeaderLink.displayName = "SidebarNavHeaderLink";

const SidebarNavLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    active?: boolean;
  }
>(({ className, children, active, ...props }, ref) => {
  const { open } = useSidebar();
  return (
    <a
      ref={ref}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        open === false ? "justify-center" : "justify-start",
        active && "bg-accent text-accent-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
});
SidebarNavLink.displayName = "SidebarNavLink";

const SidebarNavMain = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex flex-col gap-1", className)} {...props}>
      {children}
    </div>
  );
});
SidebarNavMain.displayName = "SidebarNavMain";

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-14 items-center justify-center border-t px-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SidebarFooter.displayName = "SidebarFooter";

const SidebarFooterCollapseButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, children, ...props }, ref) => {
  const { open, toggleSidebar } = useSidebar();
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        "h-9 w-9",
        open === false ? "rotate-180" : "rotate-0",
        className,
      )}
      onClick={toggleSidebar}
      {...props}
    >
      {children}
    </Button>
  );
});
SidebarFooterCollapseButton.displayName = "SidebarFooterCollapseButton";

const SidebarFooterLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, children, ...props }, ref) => {
  const { open } = useSidebar();
  return (
    <a
      ref={ref}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        open === false ? "justify-center" : "justify-start",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
});
SidebarFooterLink.displayName = "SidebarFooterLink";

const SidebarFooterText = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-1 items-center gap-2 text-sm",
        open === false ? "hidden" : "flex",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SidebarFooterText.displayName = "SidebarFooterText";

const SidebarSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      <div className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-muted" />
      <div
        className="h-4 animate-pulse rounded-md bg-muted"
        style={{ width }}
      />
    </div>
  );
});
SidebarSkeleton.displayName = "SidebarSkeleton";

export {
  Sidebar,
  SidebarProvider,
  SidebarToggle,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarMain,
  SidebarNav,
  SidebarNavHeader,
  SidebarNavHeaderLink,
  SidebarNavLink,
  SidebarNavMain,
  SidebarFooter,
  SidebarFooterCollapseButton,
  SidebarFooterLink,
  SidebarFooterText,
  SidebarSkeleton,
  useSidebar,
};