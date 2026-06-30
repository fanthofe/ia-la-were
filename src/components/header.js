export function updateHeader({ status = 'OFFLINE MODE', lotId = null } = {}) {
  const statusEl = document.getElementById('header-status')
  const lotEl = document.getElementById('header-lot')

  if (statusEl) statusEl.textContent = status

  if (lotEl) {
    if (lotId) {
      lotEl.textContent = lotId
      lotEl.classList.remove('hidden')
    } else {
      lotEl.classList.add('hidden')
    }
  }
}
