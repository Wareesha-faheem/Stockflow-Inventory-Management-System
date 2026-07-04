import { useState } from "react";
import LoginContext from "./LoginContext";
import usePersistentState from "../hooks/usePersistentState";

function LoginProvider({ children }) {
  // login form fields - transient, no reason to survive a refresh
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  // session state - persisted so a refresh doesn't kick the user back to /login
  const [isloggedin, setisloggedin] = usePersistentState("StockFlow:session:isloggedin", false);
  const [role, setRole] = usePersistentState("StockFlow:session:role", "");
  const [displayName, setDisplayName] = usePersistentState("StockFlow:session:displayName", "");

  function logout() {
    setisloggedin(false);
    setRole("");
    setDisplayName("");
    setUser("");
    setPass("");
  }

  return (
    <LoginContext.Provider
      value={{
        user,
        setUser,
        pass,
        setPass,
        isloggedin,
        setisloggedin,
        role,
        setRole,
        displayName,
        setDisplayName,
        logout,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
}

export default LoginProvider;