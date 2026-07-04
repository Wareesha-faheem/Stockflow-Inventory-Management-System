// Small reusable "inspection stamp" badge - the signature visual motif
// used across the app to mark stock status, registrations, and sales.
function Stamp({ children, type = "ok" }) {
  return <span className={`stamp ${type}`}>{children}</span>;
}

export default Stamp;
