import { useState } from 'react'

function SettingsModal({ config, onSave, onClose }) {
  const [baseUrl, setBaseUrl] = useState(config.baseUrl)
  const [timeout, setTimeout] = useState(config.timeout)

  const handleSave = () => {
    if (!baseUrl) {
      alert('Please enter a valid API URL')
      return
    }
    onSave({ baseUrl, timeout })
  }

  return (
    <div id="settings-modal" className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="api-url">API Base URL</label>
            <input
              type="text"
              id="api-url"
              placeholder="http://localhost:3000"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="api-timeout">API Timeout (ms)</label>
            <input
              type="number"
              id="api-timeout"
              placeholder="5000"
              value={timeout}
              onChange={(e) => setTimeout(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button id="save-settings" className="btn-primary" onClick={handleSave}>
            Save Settings
          </button>
          <button id="cancel-settings" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
