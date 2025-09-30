"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import {
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
  MenuIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar-state";
const SIDEBAR_COOKIE_MAX_AGE = 31536000; // 1 year
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
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

type SidebarProviderProps = {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  setOpen?: (open: boolean) => void;
};

function SidebarProvider({
  children,
  defaultOpen = true,
  open: openProp,
  setOpen: setOpenProp,
}: SidebarProviderProps) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = setOpenProp ?? _setOpen;

  const toggleSidebar = React.useCallback(() => {
    const openState = !open;
    setOpen(openState);

    // This sets the cookie to keep the sidebar state.
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
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

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return (
    <SidebarContext.Provider
      value={{ open, setOpen, toggleSidebar, isMobile }}
    >
      {isMobile ? (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-2 z-50 h-8 w-8"
            >
              <MenuIcon className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            side="left"
            className="w-3/4 pr-0"
          >
            {children}
          </SheetContent>
        </Sheet>
      ) : (
        children
      )}
    </SidebarContext.Provider>
  );
}

type SidebarProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof sidebarVariants>;

const sidebarVariants = cva(
  "group/sidebar flex h-full flex-col border-r bg-sidebar transition-[width] duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "w-64",
        collapsible: "w-16",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children, ...props }, ref) => {
    const { open, isMobile } = useSidebar();

    return (
      <aside
        ref={ref}
        data-sidebar="sidebar"
        data-mobile={isMobile}
        className={cn(
          sidebarVariants({ variant: open ? "default" : "collapsible" }),
          className,
        )}
        {...props}
      >
        <ScrollArea className="h-full">{children}</ScrollArea>
      </aside>
    );
  },
);
Sidebar.displayName = "Sidebar";

const SidebarToggle = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => {
  const { open, toggleSidebar } = useSidebar();

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        "absolute -right-4 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 rounded-full border bg-background opacity-0 shadow-md transition-all hover:bg-primary hover:text-primary-foreground group-hover/sidebar:opacity-100 focus-visible:opacity-100 lg:flex",
        className,
      )}
      onClick={toggleSidebar}
      {...props}
    >
      {open ? (
        <ChevronLeft className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </Button>
  );
});
SidebarToggle.displayName = "SidebarToggle";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { open } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-2 px-4 py-3",
        !open && "justify-center",
        className,
      )}
      {...props}
    />
  );
});
SidebarHeader.displayName = "SidebarHeader";

const SidebarHeaderTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { open } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-2 text-lg font-semibold",
        !open && "hidden",
        className,
      )}
      {...props}
    />
  );
});
SidebarHeaderTitle.displayName = "SidebarHeaderTitle";

const SidebarDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { open } = useSidebar();
  return (
    <p
      ref={ref}
      className={cn(
        "text-sm text-muted-foreground",
        !open && "hidden",
        className,
      )}
      {...props}
    />
  );
});
SidebarDescription.displayName = "SidebarDescription";

const SidebarNav = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex flex-col gap-2 p-2", className)} {...props} />
  );
});
SidebarNav.displayName = "SidebarNav";

const SidebarNavMain = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props} />
  );
});
SidebarNavMain.displayName = "SidebarNavMain";

const SidebarNavLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    icon: LucideIcon;
    isActive?: boolean;
  }
>(({ className, children, icon: Icon, isActive, ...props }, ref) => {
  const { open } = useSidebar();
  return (
    <a
      ref={ref}
      className={cn(
        "flex items-center gap-3 rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground",
        !open && "justify-center",
        className,
      )}
      {...props}
    >
      <Icon className="h-5 w-5" />
      <span className={cn(!open && "hidden")}>{children}</span>
    </a>
  );
});
SidebarNavLink.displayName = "SidebarNavLink";

const SidebarNavSub = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { open } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-2", !open && "hidden", className)}
      {...props}
    />
  );
});
SidebarNavSub.displayName = "SidebarNavSub";

const SidebarNavSubLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    isActive?: boolean;
  }
>(({ className, children, isActive, ...props }, ref) => {
  return (
    <a
      ref={ref}
      className={cn(
        "flex items-center rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground",
        className,
      )}
      {...props}
    >
      <span className="ml-2">{children}</span>
    </a>
  );
});
SidebarNavSubLink.displayName = "SidebarNavSubLink";

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { open } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "mt-auto flex items-center gap-2 p-4",
        !open && "justify-center",
        className,
      )}
      {...props}
    />
  );
});
SidebarFooter.displayName = "SidebarFooter";

const SidebarFooterLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    icon: LucideIcon;
  }
>(({ className, children, icon: Icon, ...props }, ref) => {
  const { open } = useSidebar();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          ref={ref}
          className={cn(
            "flex items-center gap-3 rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            !open && "justify-center",
            className,
          )}
          {...props}
        >
          <Icon className="h-5 w-5" />
          <span className={cn(!open && "hidden")}>{children}</span>
        </a>
      </TooltipTrigger>
      {!open && <TooltipContent side="right">{children}</TooltipContent>}
    </Tooltip>
  );
});
SidebarFooterLink.displayName = "SidebarFooterLink";

const SidebarUser = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { open } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3",
        !open && "hidden",
        className,
      )}
      {...props}
    />
  );
});
SidebarUser.displayName = "SidebarUser";

const SidebarUserAvatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("h-8 w-8 rounded-full bg-muted", className)}
      {...props}
    />
  );
});
SidebarUserAvatar.displayName = "SidebarUserAvatar";

const SidebarUserInfo = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex flex-col", className)} {...props} />
  );
});
SidebarUserInfo.displayName = "SidebarUserInfo";

const SidebarUserDisplayName = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
});
SidebarUserDisplayName.displayName = "SidebarUserDisplayName";

const SidebarUserEmail = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
});
SidebarUserEmail.displayName = "SidebarUserEmail";

const SidebarLoading = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-3 px-4 py-3", className)}
      {...props}
    >
      <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-muted" />
      <div className="h-3 animate-pulse rounded-full bg-muted" style={{ width }} />
    </div>
  );
});
SidebarLoading.displayName = "SidebarLoading";

export {
  SidebarProvider,
  Sidebar,
  SidebarToggle,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarDescription,
  SidebarNav,
  SidebarNavMain,
  SidebarNavLink,
  SidebarNavSub,
  SidebarNavSubLink,
  SidebarFooter,
  SidebarFooterLink,
  SidebarUser,
  SidebarUserAvatar,
  SidebarUserInfo,
  SidebarUserDisplayName,
  SidebarUserEmail,
  SidebarLoading,
  useSidebar,
};