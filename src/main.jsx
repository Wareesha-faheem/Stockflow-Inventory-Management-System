import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Supplier from './components/Supplier.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* <Supplier /> */}
  </StrictMode>,
)
