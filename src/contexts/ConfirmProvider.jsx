import { useCallback, useState } from "react";
import { TriangleAlert } from "lucide-react";
import ConfirmContext from "./ConfirmContext";

function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setRequest({ ...options, resolve });
    });
  }, []);

  function settle(result) {
    request?.resolve(result);
    setRequest(null);
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {request && (
        <div className="modal-backdrop" onClick={() => settle(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <span className={`modal-icon ${request.danger ? "modal-icon-danger" : ""}`}>
              <TriangleAlert size={18} />
            </span>
            <h4>{request.title || "Are you sure?"}</h4>
            {request.message && <p>{request.message}</p>}
            <div className="modal-actions">
              <button className="btn ghost" onClick={() => settle(false)}>
                {request.cancelLabel || "Cancel"}
              </button>
              <button
                className={`btn ${request.danger ? "btn-danger-solid" : ""}`}
                onClick={() => settle(true)}
              >
                {request.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export default ConfirmProvider;
