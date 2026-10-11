import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './Styles/coordinator_app.css'
import './Styles/coordinator_duty_portal.css'
import './Styles/participant_portal.css'
import './Styles/admin_qr_scanner.css'
import './Styles/breakTimer.css'
import './Styles/navonmesh_splash.css'
import './Styles/app_permissions_modal.css'
import './Styles/broadcast_notification_modal.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
