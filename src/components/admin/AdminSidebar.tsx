import {
  LayoutDashboard,
  Package,
  MessageSquare,
  Settings,
  LogOut,
  Shapes,
  Truck,
  Image,
  MessageSquareQuote,
  FileText,
  Home,
  UserRound,
  Search,
  Store,
  BadgeInfo,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/context/AdminAuthContext";
import logoImage from "@/assets/logo.png";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Categories", url: "/admin/categories", icon: Shapes },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Services", url: "/admin/services", icon: Truck },
  { title: "Gallery", url: "/admin/gallery", icon: Image },
  { title: "Testimonials", url: "/admin/testimonials", icon: MessageSquareQuote },
  { title: "Blogs", url: "/admin/blogs", icon: FileText },
  { title: "Home", url: "/admin/home", icon: Home },
  { title: "About", url: "/admin/about", icon: BadgeInfo },
  { title: "Contact", url: "/admin/contact", icon: MessageSquare },
  { title: "SEO", url: "/admin/seo", icon: Search },
  { title: "Inquiries", url: "/admin/inquiries", icon: MessageSquare },
  { title: "Vendors", url: "/admin/vendors", icon: Store },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, admin } = useAdminAuth();

  const isActive = (path: string) =>
    path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center">
              <img src={logoImage} alt="Sahyadri Surgical logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-foreground">Sahyadri Admin</h2>
              <p className="text-xs text-muted-foreground">Management Panel</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-9 w-9 items-center justify-center">
            <img src={logoImage} alt="Sahyadri Surgical logo" className="h-full w-full object-contain" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={async () => {
            await logout();
            navigate("/admin/login", { replace: true });
          }}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Logout{admin ? `, ${admin.name}` : ""}</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
