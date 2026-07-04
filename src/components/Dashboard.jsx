import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import GlobalContext from "../contexts/GlobalContext";
import LoginContext from "../contexts/LoginContext";
import Stamp from "./Stamp";
import {
  Truck,
  PackageSearch,
  Wallet,
  Users,
  ArrowRight,
  AlertTriangle,
  Receipt,
} from "lucide-react";
import { canAccess } from "../constants/roles";
import { groupRevenueByDate, topProducts } from "../utils/analytics";

const LOW_STOCK_THRESHOLD = 5;

const QUICK_ACTIONS = [
  { to: "/supplier", label: "Add supplier", key: "supplier", icon: Truck },
  { to: "/product", label: "Log new stock", key: "product", icon: PackageSearch },
  { to: "/bill", label: "Start a bill", key: "bill", icon: Receipt },
  { to: "/customer", label: "Register customer", key: "customer", icon: Users },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="chart-tooltip-value">
          {p.name}: <b>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</b>
        </p>
      ))}
    </div>
  );
}

function Dashboard() {
  const { data, salesHistory, cust, billHistory } = useContext(GlobalContext);
  const { role, displayName } = useContext(LoginContext);
  const navigate = useNavigate();

  const suppliers = Object.keys(data);
  const allProducts = suppliers.flatMap((sup) => data[sup].map((p) => ({ ...p, supplier: sup })));

  const stats = useMemo(() => {
    const revenue = billHistory.reduce((sum, b) => sum + b.total, 0);
    return { revenue };
  }, [billHistory]);

  const revenueTrend = useMemo(() => groupRevenueByDate(billHistory).slice(-14), [billHistory]);
  const bestSellers = useMemo(() => topProducts(salesHistory, 5), [salesHistory]);

  const lowStock = allProducts.filter((p) => p.quantity > 0 && p.quantity <= LOW_STOCK_THRESHOLD);
  const outOfStock = allProducts.filter((p) => p.quantity <= 0);

  const recentSales = [...salesHistory].slice(-5).reverse();
  const topCustomers = [...cust].sort((a, b) => b.spending - a.spending).slice(0, 4);

  const visibleActions = QUICK_ACTIONS.filter((a) => canAccess(role, a.key));

  return (
    <>
      <div className="manifest-head">
        <div>
          <p className="eyebrow">Manifest - Hub</p>
          <h2>{greeting()}, {displayName || "there"}</h2>
        </div>
        <div className="datestamp">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "short", year: "numeric" })}
        </div>
      </div>

      <div className="stat-row stat-row-4">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-icon" style={{backgroundColor: "#DCFCE7", // light green
    color: "#16A34A", }}><Wallet size={18} /></span>
          </div>
          <p className="stat-label">Total revenue</p>
          <p className="stat-value">PKR {stats.revenue.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-icon"><PackageSearch size={18} /></span>
          </div>
          <p className="stat-label">Products in catalog</p>
          <p className="stat-value">{allProducts.length}</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-icon" style={{
  backgroundColor: "#FFF7ED",
  color: "#F97316",
}}><Truck size={18} /></span>
          </div>
          <p className="stat-label" >Active suppliers</p>
          <p className="stat-value">{suppliers.length}</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-icon" style={{
  backgroundColor: "#F3E8FF",
  color: "#9333EA",
}}><Users size={18} /></span>
          </div>
          <p className="stat-label">Registered customers</p>
          <p className="stat-value">{cust.length}</p>
        </div>
      </div>

      <div className="chart-grid">
        <div className="panel chart-panel">
          <h3>Revenue trend</h3>
          {revenueTrend.length === 0 ? (
            <p className="empty-row" style={{ padding: "24px 0" }}>Generate a bill to start seeing revenue trends.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueTrend} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B5CFF" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3B5CFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#EEF0F8" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10.5, fill: "#9599B4" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10.5, fill: "#9599B4" }} axisLine={false} tickLine={false} width={46} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3B5CFF" strokeWidth={2.5} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="panel chart-panel">
          <h3>Best sellers</h3>
          {bestSellers.length === 0 ? (
            <p className="empty-row" style={{ padding: "24px 0" }}>No products sold yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bestSellers} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="#EEF0F8" vertical={false} />
                <XAxis dataKey="product" tick={{ fontSize: 10, fill: "#9599B4" }} axisLine={false} tickLine={false} interval={0} angle={-12} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 10.5, fill: "#9599B4" }} axisLine={false} tickLine={false} width={46} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#16C79A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="hub-grid">
        <div className="panel">
          <h3>Stock alerts</h3>
          {lowStock.length === 0 && outOfStock.length === 0 ? (
            <p className="empty-row" style={{ padding: "8px 0" }}>Every product is comfortably stocked.</p>
          ) : (
            <ul className="alert-list">
              {outOfStock.map((p) => (
                <li className="alert-row" key={`out-${p.supplier}-${p.name}`}>
                  <AlertTriangle size={15} className="alert-icon danger" />
                  <span><b>{p.name}</b> from {p.supplier} is out of stock</span>
                  <Stamp type="out">Out</Stamp>
                </li>
              ))}
              {lowStock.map((p) => (
                <li className="alert-row" key={`low-${p.supplier}-${p.name}`}>
                  <AlertTriangle size={15} className="alert-icon warning" />
                  <span><b>{p.name}</b> from {p.supplier} has only {p.quantity} left</span>
                  <Stamp type="low">Low</Stamp>
                </li>
              ))}
            </ul>
          )}
          {visibleActions.length > 0 && (
            <div className="quick-actions">
              {visibleActions.map((a) => (
                <button key={a.to} className="quick-action" onClick={() => navigate(a.to)}>
                  <a.icon size={16} />
                  <span>{a.label}</span>
                  <ArrowRight size={14} className="quick-action-arrow" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <h3>Recent activity</h3>
          {recentSales.length === 0 ? (
            <p className="empty-row" style={{ padding: "8px 0" }}>No sales logged yet.</p>
          ) : (
            <ul className="activity-list">
              {recentSales.map((s, i) => (
                <li className="activity-row" key={i}>
                  <span className="activity-dot" />
                  <div>
                    <p className="activity-title">Sold {s.quantity} × {s.product}</p>
                    <p className="activity-meta">{s.supplier} · PKR {s.total.toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {topCustomers.length > 0 && canAccess(role, "customer") && (
        <div className="panel">
          <h3>Top customers</h3>
          <table className="ledger">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Spending</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td className="num">{c.phone || "-"}</td>
                  <td className="num">{c.ordersplaced}</td>
                  <td className="num">PKR {c.spending.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default Dashboard;
