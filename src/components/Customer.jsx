import { useState, useContext } from "react";
import Stamp from "./Stamp";
import GlobalContext from "../contexts/GlobalContext";
import { UserPlus, Search } from "lucide-react";
function Customer() {
  const { cust, setcust } = useContext(GlobalContext);
  const [custname, setcustname] = useState("");
  const [custphone, setcustphone] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  function addcust() {
    const name = custname.trim();
    const phone = custphone.trim();

    if (!name) {
      setError("Customer name is required.");
      return;
    }
    if (!phone) {
      setError("Customer phone number is required.");
      return;
    }
    if (cust.some((c) => c.phone === phone)) {
      setError(`A customer with phone "${phone}" is already registered.`);
      return;
    }

    setcust((prev) => [
      ...prev,
      {
        id: prev.length,
        name,
        phone,
        ordersplaced: 0,
        spending: 0,
      },
    ]);

    setcustname("");
    setcustphone("");
    setError("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") addcust();
  }

  const visibleCust = cust.filter(
    (c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.phone.includes(query),
  );

  return (
    <>
      <div className="manifest-head">
        <div>
          <p className="eyebrow">Manifest - Section 05</p>
          <h2>Customers</h2>
        </div>
        <div className="datestamp">{cust.length} registered</div>
      </div>

      <div className="panel">
        <h3>Register Customer</h3>
        <div className="field-row">
          <div className="field">
            <label htmlFor="custname">Customer Name</label>
            <input
              id="custname"
              type="text"
              value={custname}
              onChange={(e) => setcustname(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="field">
            <label htmlFor="custphonenum">Phone Number</label>
            <input
              id="custphonenum"
              type="tel"
              value={custphone}
              onChange={(e) => setcustphone(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
        <button className="btn" onClick={addcust}>
          <UserPlus size={15} style={{ marginRight: 6, verticalAlign: -2 }} />
          Add Customer
        </button>
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="panel">
        <div className="panel-toolbar">
          <h3 style={{ margin: 0 }}>Customer Directory</h3>
          {cust.length > 0 && (
            <div className="toolbar-controls">
              <div className="search-box">
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Search name or phone"
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
              <th>Name</th>
              <th>Phone</th>
              <th>Orders</th>
              <th>Spending</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleCust.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-row">
                  {cust.length === 0 ? "No customers registered yet." : "No customers match that search."}
                </td>
              </tr>
            ) : (
              visibleCust.map((eachcust, index) => (
                <tr key={index}>
                  <td>{eachcust.name}</td>
                  <td className="num">{eachcust.phone || "-"}</td>
                  <td className="num">{eachcust.ordersplaced}</td>
                  <td className="num">PKR {eachcust.spending}</td>
                  <td>
                    {eachcust.ordersplaced > 0 ? (
                      <Stamp type="ok">Returning</Stamp>
                    ) : (
                      <Stamp type="low">New</Stamp>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Customer;
