import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  PackagePlus,
  Receipt,
  BarChart3,
  Users,
  ShieldCheck,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { canAccess } from "../constants/roles";
import logo from "../assets/logo.png";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Hub", no: "00", key: "dashboard", icon: LayoutDashboard },
  { to: "/supplier", label: "Suppliers", no: "01", key: "supplier", icon: Truck },
  { to: "/product", label: "Stock In", no: "02", key: "product", icon: PackagePlus },
  { to: "/bill", label: "Billing", no: "03", key: "bill", icon: Receipt },
  { to: "/sales", label: "Report", no: "04", key: "sales", icon: BarChart3 },
  { to: "/customer", label: "Customers", no: "05", key: "customer", icon: Users },
  { to: "/users", label: "Users", no: "06", key: "users", icon: ShieldCheck },
];

function Sidebar({ role, displayName, onLogout, collapsed, onToggleCollapse }) {
  const items = NAV_ITEMS.filter((item) => canAccess(role, item.key));

  return (
    <aside className={`signboard ${collapsed ? "is-collapsed" : ""}`}>
      <div className="signboard-brand">
        <div className={`signboard-brand-row ${collapsed ? "is-centered" : ""}`}>
          <span className="mark"><img src={logo} alt="SF" width={"41px"} style={{borderRadius:"9px"}}/></span>
          {!collapsed && (
            <button
              className="collapse-btn"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>
        {!collapsed ? (
          <>
            <h1>StockFlow</h1>
            <p>Inventory Management</p>
          </>
        ) : (
          <button
            className="collapse-btn collapse-btn-standalone"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen size={16} />
          </button>
        )}
      </div>

      <nav>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? "active" : "")}
            title={item.label}
          >
            <item.icon size={17} strokeWidth={2.25} className="nav-icon" />
            {!collapsed && (
              <>
                <span className="nav-label">{item.label}</span>
                {/* <span className="tag-no">{item.no}</span> */}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="signboard-foot">
        {!collapsed && (
          <div className="signboard-user">
            <span className="signboard-user-avatar">{(displayName || "?").slice(0, 1).toUpperCase()}</span>
            <div>
              <p className="signboard-user-name">{displayName}</p>
              <p className="signboard-user-role">{role}</p>
            </div>
          </div>
        )}
        <button className="signboard-logout" onClick={onLogout}>
          <LogOut size={15} />
          {!collapsed && <span>Log out</span>}
        </button>
        {!collapsed && <p className="signboard-credit">Built with ❤️ by <a href="http://www.linkedin.com/in/wareesha-faheem" style={{
    textDecoration: "none",
    color: "white",
  }}> "Wareesha Faheem"</a></p>}
      </div>
    </aside>
  );
}

export default Sidebar;
