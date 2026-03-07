import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const isTestViz = new URLSearchParams(window.location.search).get('test') === 'viz'
const VizTestPage = lazy(() => import('./VisualizationTestPage.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isTestViz ? <Suspense fallback={null}><VizTestPage /></Suspense> : <App />}
  </StrictMode>,
)
