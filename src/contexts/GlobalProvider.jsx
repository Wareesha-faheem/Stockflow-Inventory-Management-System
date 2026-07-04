import { useState } from "react";
import GlobalContext from "./GlobalContext";
import usePersistentState from "../hooks/usePersistentState";

const SEED_USERS = [
  {
    id: 1,
    username: "Wareesha",
    password: "1234",
    role: "Super Admin",
    email: "wareesha@StockFlow.app",
    active: true,
  },
  {
    id: 2,
    username: "Bilal",
    password: "4321",
    role: "Store Owner",
    email: "bilal@StockFlow.app",
    active: true,
  },
  {
    id: 3,
    username: "Ali",
    password: "5678",
    role: "Manager",
    email: "ali@StockFlow.app",
    active: true,
  },
  {
    id: 4,
    username: "Sara",
    password: "9999",
    role: "Cashier/Biller",
    email: "sara@StockFlow.app",
    active: true,
  },
];

function GlobalProvider({ children }) {
  const [data, setdata] = usePersistentState("StockFlow:data", {});
  const [salesHistory, setSalesHistory] = usePersistentState("StockFlow:salesHistory", []);
  const [selected, setSelected] = useState("");
  const [cust, setcust] = usePersistentState("StockFlow:customers", []);

  // drives the Users module + Login's account list
  const [appUsers, setAppUsers] = usePersistentState("StockFlow:users", SEED_USERS);

  // one entry per generated bill (unique id, full line items, totals) -
  // powers receipt re-downloads and the detailed sales report
  const [billHistory, setBillHistory] = usePersistentState("StockFlow:bills", []);

  return (
    <GlobalContext.Provider
      value={{
        data,
        setdata,
        salesHistory,
        setSalesHistory,
        selected,
        setSelected,
        cust,
        setcust,
        appUsers,
        setAppUsers,
        billHistory,
        setBillHistory,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export default GlobalProvider;