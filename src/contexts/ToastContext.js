import { createContext } from "react";

// value shape: { pushToast(message, type) }
const ToastContext = createContext(null);

export default ToastContext;
