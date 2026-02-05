import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { QrCode, Server } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 md:p-6 pointer-events-none">
      <div className="bg-secondary/80 backdrop-blur-md border border-white/5 rounded-full p-1.5 shadow-2xl pointer-events-auto flex gap-1">
        <NavItem 
          href="/" 
          active={location === "/"} 
          icon={<QrCode className="w-4 h-4 mr-2" />}
        >
          Pairing
        </NavItem>
        <NavItem 
          href="/admin" 
          active={location === "/admin"} 
          icon={<Server className="w-4 h-4 mr-2" />}
        >
          Sessions
        </NavItem>
      </div>
    </nav>
  );
}

function NavItem({ href, active, children, icon }: { href: string, active: boolean, children: React.ReactNode, icon: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className={cn(
        "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center",
        active 
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
