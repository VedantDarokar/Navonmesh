import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './Styles/coordinator_app.css'
import './Styles/coordinator_duty_portal.css'
import './Styles/participant_portal.css'
import './Styles/admin_qr_scanner.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
