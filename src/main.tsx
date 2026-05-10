import './styles/global.css'
import App from './App'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Inject axe-core a11y auditing in development (logs to browser console)
if (import.meta.env.DEV) {
  Promise.all([
    import('react'),
    import('react-dom'),
    import('@axe-core/react'),
  ]).then(([React, ReactDOM, axe]) => {
    axe.default(React, ReactDOM, 1000)
  })
}
