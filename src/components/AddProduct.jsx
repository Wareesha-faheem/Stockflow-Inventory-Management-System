import { useState, useContext } from "react";
import Stamp from "./Stamp";
import GlobalContext from "../contexts/GlobalContext";
import { PackagePlus, Search } from "lucide-react";
const LOW_STOCK_THRESHOLD = 5;

function stockStamp(qty) {
  if (qty <= 0) return <Stamp type="out">Out</Stamp>;
  if (qty <= LOW_STOCK_THRESHOLD) return <Stamp type="low">Low</Stamp>;
  return <Stamp type="ok">In Stock</Stamp>;
}

function AddProduct() {
  const { data, setdata } = useContext(GlobalContext);
  const [form, setForm] = useState({
    name: "",
    pprice: "",
    sprice: "",
    quantity: "",
    supplier: "",
  });
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addprod() {
    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!form.supplier) {
      setError("Select a supplier for this product.");
      return;
    }

    const newProduct = {
      name: form.name.trim(),
      pprice: Number(form.pprice) || 0,
      sprice: Number(form.sprice) || 0,
      quantity: Number(form.quantity) || 0,
    };

    setdata({
      ...data,
      [form.supplier]: [...data[form.supplier], newProduct],
    });

    setForm({ name: "", pprice: "", sprice: "", quantity: "", supplier: form.supplier });
    setError("");
  }

  const suppliers = Object.keys(data);
  const allProducts = suppliers.flatMap((sup) =>
    data[sup].map((item, i) => ({ ...item, supplier: sup, key: `${sup}-${i}` })),
  );

  const visibleProducts = allProducts.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.supplier.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <div className="manifest-head">
        <div>
          <p className="eyebrow">Manifest - Section 02</p>
          <h2>Stock In</h2>
        </div>
        <div className="datestamp">{allProducts.length} line items</div>
      </div>

      <div className="panel">
        <h3>Log Purchased Product</h3>

        <div className="field-row">
          <div className="field">
            <label htmlFor="pname">Product Name</label>
            <input
              id="pname"
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="supplier">Supplier</label>
            <select
              id="supplier"
              value={form.supplier}
              onChange={(e) => update("supplier", e.target.value)}
            >
              <option value="">Select supplier</option>
              {suppliers.map((sup) => (
                <option key={sup} value={sup}>
                  {sup}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="pprice">Purchase Price</label>
            <input
              id="pprice"
              type="number"
              min="0"
              value={form.pprice}
              onChange={(e) => update("pprice", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="sprice">Sale Price</label>
            <input
              id="sprice"
              type="number"
              min="0"
              value={form.sprice}
              onChange={(e) => update("sprice", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="qty">Quantity</label>
            <input
              id="qty"
              type="number"
              min="0"
              value={form.quantity}
              onChange={(e) => update("quantity", e.target.value)}
            />
          </div>
        </div>

        {suppliers.length === 0 && (
          <p className="error-text">
            Register a supplier first on the Suppliers page.
          </p>
        )}

        <button className="btn" onClick={addprod} disabled={suppliers.length === 0}>
          <PackagePlus size={15} style={{ marginRight: 6, verticalAlign: -2 }} />
          Add Product
        </button>
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="panel">
        <div className="panel-toolbar">
          <h3 style={{ margin: 0 }}>Available Products</h3>
          <div className="toolbar-controls">
            <div className="search-box">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search product or supplier"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        <table className="ledger">
          <thead>
            <tr>
              <th>Product</th>
              <th>Supplier</th>
              <th>Purchase</th>
              <th>Sale</th>
              <th>Qty</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-row">
                  {allProducts.length === 0 ? "No products logged yet." : "No products match that search."}
                </td>
              </tr>
            ) : (
              visibleProducts.map((item) => (
                <tr key={item.key}>
                  <td>{item.name}</td>
                  <td>{item.supplier}</td>
                  <td className="num">PKR {item.pprice}</td>
                  <td className="num">PKR {item.sprice}</td>
                  <td className="num">{item.quantity}</td>
                  <td>{stockStamp(item.quantity)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AddProduct;
