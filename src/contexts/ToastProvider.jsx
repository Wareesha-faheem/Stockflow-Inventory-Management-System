import { useCallback, useRef, useState } from "react";
import ToastContext from "./ToastContext";

let idCounter = 0;

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const pushToast = useCallback(
    (message, type = "info") => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      timers.current[id] = setTimeout(() => dismissToast(id), 4200);
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div className={`toast toast-${t.type}`} key={t.id}>
            <span className="toast-dot" />
            <p>{t.message}</p>
            <button
              className="toast-close"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
