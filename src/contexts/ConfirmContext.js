import { createContext } from "react";

// value shape: { confirm(options) => Promise<boolean> }
const ConfirmContext = createContext(null);

export default ConfirmContext;
