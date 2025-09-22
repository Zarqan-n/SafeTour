import { Shield, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="text-primary-foreground text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">SafeTravel</h1>
              <p className="text-xs text-muted-foreground">Emergency & Places Finder</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a 
              href="/" 
              className="text-foreground hover:text-primary transition-colors font-medium"
              data-testid="nav-dashboard"
            >
              Dashboard
            </a>
            <a 
              href="/alerts" 
              className="text-muted-foreground hover:text-primary transition-colors"
              data-testid="nav-alerts"
            >
              Alerts
            </a>
            <a 
              href="/sos" 
              className="text-muted-foreground hover:text-primary transition-colors"
              data-testid="nav-sos"
            >
              SOS
            </a>
            <a 
              href="/help" 
              className="text-muted-foreground hover:text-primary transition-colors"
              data-testid="nav-help"
            >
              Help
            </a>
          </nav>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden"
            data-testid="button-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
