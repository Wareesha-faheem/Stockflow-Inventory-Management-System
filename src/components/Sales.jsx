import { useContext, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import GlobalContext from "../contexts/GlobalContext";
import { Wallet, PackageCheck, Receipt, TrendingUp, Search, Download } from "lucide-react";
import { groupRevenueByDate, topProducts } from "../utils/analytics";
import { downloadReceiptPdf } from "../utils/receipt";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="chart-tooltip-value">
          {p.name}: <b>PKR {p.value.toLocaleString()}</b>
        </p>
      ))}
    </div>
  );
}

function Sales() {
  const { salesHistory, billHistory } = useContext(GlobalContext);
  const [query, setQuery] = useState("");

  let total = 0;
  let unitsSold = 0;
  salesHistory.forEach((sale) => {
    total += sale.total;
    unitsSold += sale.quantity;
  });

  const transactions = billHistory.length;
  const avgOrderValue = transactions > 0 ? Math.round(total / transactions) : 0;

  const revenueTrend = useMemo(() => groupRevenueByDate(billHistory), [billHistory]);
  const productPerformance = useMemo(() => topProducts(salesHistory, 100), [salesHistory]);

  const filteredInvoices = [...billHistory]
    .reverse()
    .filter(
      (b) =>
        b.id.toLowerCase().includes(query.toLowerCase()) ||
        b.customerName.toLowerCase().includes(query.toLowerCase()),
    );

  return (
    <>
      <div className="manifest-head">
        <div>
          <p className="eyebrow">Manifest - Section 04</p>
          <h2>Sales Report</h2>
        </div>
        <div className="datestamp">Session summary</div>
      </div>

      <div className="stat-row stat-row-4">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-icon" style={{
  backgroundColor: "#ECFDF5",
  color: "#10B981",
}}><Wallet size={18} /></span>
          </div>
          <p className="stat-label">Revenue</p>
          <p className="stat-value">PKR {total.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-icon"><PackageCheck size={18} /></span>
          </div>
          <p className="stat-label">Units Sold</p>
          <p className="stat-value">{unitsSold}</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-icon" style={{
  backgroundColor: "#FFFBEB",
  color: "#F59E0B",
}}><Receipt size={18} /></span>
          </div>
          <p className="stat-label">Bills Generated</p>
          <p className="stat-value">{transactions}</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-icon" style={{
  backgroundColor: "#F3E8FF",
  color: "#8B5CF6",
}}><TrendingUp size={18} /></span>
          </div>
          <p className="stat-label">Avg. Order Value</p>
          <p className="stat-value">PKR {avgOrderValue.toLocaleString()}</p>
        </div>
      </div>

      <div className="panel chart-panel">
        <h3>Revenue over time</h3>
        {revenueTrend.length === 0 ? (
          <p className="empty-row" style={{ padding: "24px 0" }}>No bills generated yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueTrend} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="salesRevenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B5CFF" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3B5CFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#EEF0F8" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10.5, fill: "#9599B4" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10.5, fill: "#9599B4" }} axisLine={false} tickLine={false} width={50} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3B5CFF" strokeWidth={2.5} fill="url(#salesRevenueFill)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="panel">
        <h3>Product performance</h3>
        <table className="ledger">
          <thead>
            <tr>
              <th>Product</th>
              <th>Units sold</th>
              <th>Revenue</th>
              <th>Share of revenue</th>
            </tr>
          </thead>
          <tbody>
            {productPerformance.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-row">No products sold yet this session.</td>
              </tr>
            ) : (
              productPerformance.map((p) => (
                <tr key={p.product}>
                  <td>{p.product}</td>
                  <td className="num">{p.units}</td>
                  <td className="num">PKR {p.revenue.toLocaleString()}</td>
                  <td>
                    <div className="share-bar-track">
                      <div
                        className="share-bar-fill"
                        style={{ width: `${total > 0 ? Math.round((p.revenue / total) * 100) : 0}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-toolbar">
          <h3 style={{ margin: 0 }}>Invoices</h3>
          {billHistory.length > 0 && (
            <div className="toolbar-controls">
              <div className="search-box">
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Search receipt ID or customer"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
        <table className="ledger">
          <thead>
            <tr>
              <th>Receipt ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-row">
                  {billHistory.length === 0 ? "No bills generated yet." : "No invoices match that search."}
                </td>
              </tr>
            ) : (
              filteredInvoices.map((b) => (
                <tr key={b.id}>
                  <td className="num">{b.id}</td>
                  <td>{b.customerName}</td>
                  <td className="num">{b.date}</td>
                  <td className="num">{b.items.length}</td>
                  <td className="num">PKR {b.total.toLocaleString()}</td>
                  <td>
                    <button className="action-btn" onClick={() => downloadReceiptPdf(b)} title="Download receipt">
                      <Download size={12} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <h3>Line-item log</h3>
        <table className="ledger">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Product</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {salesHistory.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-row">
                  Nothing sold yet this session.
                </td>
              </tr>
            ) : (
              [...salesHistory].reverse().map((sale, index) => (
                <tr key={index}>
                  <td>{sale.supplier}</td>
                  <td>{sale.product}</td>
                  <td className="num">PKR {sale.price}</td>
                  <td className="num">{sale.quantity}</td>
                  <td className="num">PKR {sale.total}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Sales;
