import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ChangelogPage from './components/ChangelogPage.jsx'
import './styles/globals.css'

function Root() {
  const path = window.location.pathname;

  if (path === '/changelog') {
    return <ChangelogPage onBack={() => { window.location.href = '/'; }} />;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
