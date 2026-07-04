import { useState, useEffect, useContext } from "react";
import GlobalContext from "../contexts/GlobalContext";
import { ShoppingCart, Download } from "lucide-react";
import { generateReceiptId, downloadReceiptPdf } from "../utils/receipt";

function Billing() {
  const { data, setdata, salesHistory, setSalesHistory, cust, setcust, billHistory, setBillHistory } =
    useContext(GlobalContext);
  const [selected, setSelected] = useState("");
  const [quan, setQuan] = useState("");
  const [error, setError] = useState("");
  const [total, settotal] = useState(0);
  const [cart, setcart] = useState([]);
  const [name, setname] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [success, setSuccess] = useState("");
  const [date, setDate] = useState("");

  const options = Object.entries(data).flatMap(([supplier, products]) =>
    products.map((product, index) => ({
      value: `${supplier}-${index}`,
      label: `${product.name} (${supplier})`,
      supplier,
      index,
      product,
    })),
  );

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  function addtobill() {
    const choice = options.find((o) => o.value === selected);
    const quantity = Number(quan);

    if (!choice) {
      setError("Select a product to sell.");
      return;
    }
    if (!quantity || quantity <= 0) {
      setError("Enter a quantity greater than zero.");
      return;
    }
    if (quantity > choice.product.quantity) {
      setError("Quantity exceeds current stock.");
      return;
    }

    const updatedSupplierStock = data[choice.supplier].map((item, i) =>
      i === choice.index
        ? { ...item, quantity: item.quantity - quantity }
        : item,
    );

    setdata({ ...data, [choice.supplier]: updatedSupplierStock });

    settotal((prev) => prev + quantity * choice.product.sprice);

    setcart((prev) => [
      ...prev,
      {
        supplier: choice.supplier,
        product: choice.product.name,
        price: choice.product.sprice,
        quantity,
        total: quantity * choice.product.sprice,
      },
    ]);

    setSelected("");
    setQuan("");
    setError("");
  }

  function remove(index) {
    const removedItem = cart[index];

    settotal((prev) => prev - removedItem.total);
    setcart((prev) => prev.filter((_, i) => i !== index));

    // return quantity back to stock
    const supplierProducts = data[removedItem.supplier].map((product) =>
      product.name === removedItem.product
        ? { ...product, quantity: product.quantity + removedItem.quantity }
        : product,
    );

    setdata((prev) => ({
      ...prev,
      [removedItem.supplier]: supplierProducts,
    }));
  }

  const tax = Math.floor(0.15 * total);
  const grandTotal = Math.floor(total + 0.15 * total);

  function generateBill() {
    if (cart.length === 0) {
      setError("Add at least one product to the bill first.");
      return;
    }

    const customerName = name.trim();

    // walk-in customers who aren't registered yet get created automatically
    // (this used to silently do nothing if the name didn't match anyone)
    if (customerName) {
      const existing = cust.find(
        (u) => u.name.toLowerCase() === customerName.toLowerCase(),
      );
      if (existing) {
        setcust((prev) =>
          prev.map((u) =>
            u.id === existing.id
              ? { ...u, ordersplaced: u.ordersplaced + 1, spending: u.spending + total }
              : u,
          ),
        );
      } else {
        setcust((prev) => [
          ...prev,
          {
            id: (prev.at(-1)?.id ?? -1) + 1,
            name: customerName,
            phone: "",
            ordersplaced: 1,
            spending: total,
          },
        ]);
      }
    }

    const billId = generateReceiptId(billHistory.length + 1);
    const newBill = {
      id: billId,
      customerName: customerName || "Walk-in customer",
      date,
      items: cart,
      subtotal: total,
      tax,
      total: grandTotal,
    };

    setBillHistory((prev) => [...prev, newBill]);
    setSalesHistory((prev) => [...prev, ...cart]);
    downloadReceiptPdf(newBill);

    setSuccess(
      `Bill ${billId} generated for ${newBill.customerName} - PKR ${grandTotal} total. Downloading receipt…`,
    );
    setcart([]);
    settotal(0);
    setError("");
  }

  const filteredCustomers = cust.filter((customer) => {
    const customerName = customer.name.toLowerCase();
    const typedText = name.toLowerCase();
    return customerName.includes(typedText);
  });

  function custavb(id) {
    const selcus = cust.find((c) => c.id === id);
    if (selcus) {
      setname(selcus.name);
      setShowSuggestions(false);
    }
  }

  const recentBills = [...billHistory].slice(-3).reverse();

  return (
    <>
      <div className="manifest-head">
        <div>
          <p className="eyebrow">Manifest - Section 03</p>
          <h2>Billing</h2>
        </div>
        <div className="datestamp">{billHistory.length} bills generated</div>
      </div>

      <div className="panel">
        <h3>Customer & Date</h3>
        <div className="field-row">
          <div className="field" style={{ position: "relative" }}>
            <label htmlFor="custname">Customer Name</label>
            <input
              id="custname"
              type="text"
              placeholder="Walk-in customer"
              value={name}
              onChange={(e) => {
                setname(e.target.value);
                setShowSuggestions(true);
              }}
              autoComplete="off"
            />
            {showSuggestions && name.trim() !== "" && filteredCustomers.length > 0 && (
              <ul className="autocomplete-list">
                {filteredCustomers.map((customer) => (
                  <li key={customer.id}>
                    <button type="button" onClick={() => custavb(customer.id)}>
                      {customer.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="field">
            <label htmlFor="billdate">Date</label>
            <input
              id="billdate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>Add Product to Bill</h3>
        <div className="field-row">
          <div className="field">
            <label htmlFor="product">Product</label>
            <select
              id="product"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Select product</option>
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label} - {o.product.quantity} in stock
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="quan">Quantity</label>
            <input
              id="quan"
              type="number"
              min="1"
              value={quan}
              onChange={(e) => setQuan(e.target.value)}
            />
          </div>
        </div>

        {options.length === 0 && (
          <p className="error-text">
            No products in stock yet - add some on the Stock In page.
          </p>
        )}

        <button
          className="btn"
          onClick={addtobill}
          disabled={options.length === 0}
        >
          <ShoppingCart size={15} style={{ marginRight: 6, verticalAlign: -2 }} />
          Add to Bill
        </button>
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="panel">
        <h3>Current Bill</h3>
        {cart.length === 0 ? (
          <p className="empty-row" style={{ padding: "8px 0" }}>
            No items added yet.
          </p>
        ) : (
          <>
            <ul className="cart-list">
              {cart.map((prod, index) => (
                <li className="cart-row" key={index}>
                  <div className="cart-meta">
                    <b>{prod.product}</b>
                    <span>Qty {prod.quantity}</span>
                    <span>PKR {prod.price}</span>
                    <span>Total PKR {prod.total}</span>
                  </div>
                  <button className="remove-btn" onClick={() => remove(index)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <div className="totals-block">
              <div className="totals-line">
                <span>Subtotal</span>
                <span>PKR {total}</span>
              </div>
              <div className="totals-line">
                <span>Tax (15%)</span>
                <span>PKR {tax}</span>
              </div>
              <div className="totals-line grand">
                <span>Grand Total</span>
                <span>PKR {grandTotal}</span>
              </div>
            </div>
          </>
        )}

        <button
          className="btn"
          style={{ marginTop: 18 }}
          onClick={generateBill}
          disabled={cart.length === 0}
        >
          <Download size={15} style={{ marginRight: 6, verticalAlign: -2 }} />
          Generate & Download Bill
        </button>
        {success && <p className="bill-success">{success}</p>}
      </div>

      {recentBills.length > 0 && (
        <div className="panel">
          <h3>Recently generated</h3>
          <table className="ledger">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentBills.map((b) => (
                <tr key={b.id}>
                  <td className="num">{b.id}</td>
                  <td>{b.customerName}</td>
                  <td className="num">{b.date}</td>
                  <td className="num">PKR {b.total}</td>
                  <td>
                    <button className="action-btn" onClick={() => downloadReceiptPdf(b)} title="Download again">
                      <Download size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default Billing;