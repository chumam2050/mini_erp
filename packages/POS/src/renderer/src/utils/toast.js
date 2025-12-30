export function showToast({ id = Date.now(), type = 'info', message = '', timeout = 5000 } = {}) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { id, type, message, timeout } }))
}

// Convenience wrappers
export const toastSuccess = (message, timeout) => showToast({ type: 'success', message, timeout })
export const toastError = (message, timeout) => showToast({ type: 'error', message, timeout })
export const toastInfo = (message, timeout) => showToast({ type: 'info', message, timeout })
export const toastWarn = (message, timeout) => showToast({ type: 'warning', message, timeout })
