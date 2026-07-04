import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import "./App.css";
import AddProduct from "./components/AddProduct";
import Supplier from "./components/Supplier";
import Sales from "./components/Sales";
import Billing from "./components/Billing";
import Customer from "./components/Customer";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Users from "./components/Users";
import LoginContext from "./contexts/LoginContext";
import LoginProvider from "./contexts/LoginProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import GlobalProvider from "./contexts/GlobalProvider";
import ToastProvider from "./contexts/ToastProvider";
import ConfirmProvider from "./contexts/ConfirmProvider";
import ConfirmContext from "./contexts/ConfirmContext";
import Sidebar from "./components/Sidebar";

// Lives inside BrowserRouter so it can read the current route
// (needed to give /login its own full-screen centered layout).
function ShellInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginRoute = location.pathname === "/login";
  const { isloggedin, role, displayName, logout } = useContext(LoginContext);
  const { confirm } = useContext(ConfirmContext);
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    const ok = await confirm({
      title: "Log out of StockFlow?",
      message: "You'll need to sign in again to get back to your dashboard.",
      confirmLabel: "Log out",
      danger: true,
    });
    if (!ok) return;
    logout();
    navigate("/login");
  }

  const showSidebar = isloggedin && !isLoginRoute;

  return (
    <div className={`shell ${showSidebar && collapsed ? "shell-collapsed" : ""}`}>
      {showSidebar && (
        <Sidebar
          role={role}
          displayName={displayName}
          onLogout={handleLogout}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      )}

      <main className={isLoginRoute ? "manifest manifest--login" : `manifest ${showSidebar ? "" : "manifest--full"}`}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/supplier" element={<ProtectedRoute roles={["Super Admin", "Store Owner", "Manager"]}><Supplier /></ProtectedRoute>} />
          <Route path="/product" element={<ProtectedRoute roles={["Super Admin", "Store Owner", "Manager"]}><AddProduct /></ProtectedRoute>} />
          <Route path="/bill" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute roles={["Super Admin", "Store Owner", "Manager"]}><Sales /></ProtectedRoute>} />
          <Route path="/customer" element={<ProtectedRoute><Customer /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute roles={["Super Admin", "Store Owner"]}><Users /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <LoginProvider>
      <GlobalProvider>
        <ToastProvider>
          <ConfirmProvider>
            <BrowserRouter>
              <ShellInner />
            </BrowserRouter>
          </ConfirmProvider>
        </ToastProvider>
      </GlobalProvider>
    </LoginProvider>
  );
}

export default App;
