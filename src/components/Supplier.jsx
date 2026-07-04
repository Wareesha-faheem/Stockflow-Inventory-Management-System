import { useState, useContext } from "react";
import Stamp from "./Stamp";
import GlobalContext from "../contexts/GlobalContext";
import { Truck, Search } from "lucide-react";

function Supplier() {
  const { data, setdata } = useContext(GlobalContext);
  const [supname, setspname] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  function addsupplier() {
    const name = supname.trim();
    if (!name) {
      setError("Enter a supplier name before registering.");
      return;
    }
    if (data[name]) {
      setError(`"${name}" is already registered.`);
      return;
    }
    setdata({ ...data, [name]: [] });
    setspname("");
    setError("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") addsupplier();
  }

  const suppliers = Object.keys(data);
  const visibleSuppliers = suppliers.filter((sup) => sup.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <div className="manifest-head">
        <div>
          <p className="eyebrow">Manifest - Section 01</p>
          <h2>Suppliers</h2>
        </div>
        <div className="datestamp">{suppliers.length} registered</div>
      </div>

      <div className="panel">
        <h3>Register Supplier</h3>
        <div className="field-row">
          <div className="field">
            <label htmlFor="supname">Supplier Name</label>
            <input
              id="supname"
              type="text"
              placeholder="e.g. Crescent Traders"
              value={supname}
              onChange={(e) => setspname(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
        <button className="btn" onClick={addsupplier}>
          <Truck size={15} style={{ marginRight: 6, verticalAlign: -2 }} />
          Add Supplier
        </button>
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="panel">
        <div className="panel-toolbar">
          <h3 style={{ margin: 0 }}>Registered Suppliers</h3>
          {suppliers.length > 0 && (
            <div className="toolbar-controls">
              <div className="search-box">
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Search suppliers"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
        {suppliers.length === 0 ? (
          <p className="empty-row" style={{ padding: "8px 0" }}>
            No suppliers yet - add one above to get started.
          </p>
        ) : visibleSuppliers.length === 0 ? (
          <p className="empty-row" style={{ padding: "8px 0" }}>
            No suppliers match that search.
          </p>
        ) : (
          <div className="chip-grid">
            {visibleSuppliers.map((sup) => (
              <div className="chip" key={sup}>
                <span className="dot" />
                {sup}
                <Stamp type="reg">{data[sup].length} items</Stamp>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Supplier;
