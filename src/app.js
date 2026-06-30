import { state } from './state.js'
import { updateHeader } from './components/header.js'
import { updateNav } from './components/nav.js'
import { renderDashboard } from './screens/dashboard.js'
import { mountAnalyse, pauseAnalyse, stopAnalyse } from './screens/analyse.js'
import { renderRapport, filterGallery, exportJSON } from './screens/rapport.js'

// ── Navigation ────────────────────────────────────────────────────

export function navigate(screen, lot = null) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
  document.getElementById('screen-' + screen)?.classList.add('active')
  updateNav(screen)
  state.screen = screen

  if (screen === 'dashboard') {
    updateHeader({ status: 'OFFLINE MODE', lotId: null })
    renderDashboard()
  }
  if (screen === 'rapport') {
    renderRapport(lot ?? state.rapportLot ?? state.lots[0])
  }
}

// ── Actions ───────────────────────────────────────────────────────

function viewRapport(id) {
  const lot = state.lots.find(l => l.id === id)
  if (!lot) return
  state.rapportLot = lot
  navigate('rapport', lot)
}

function startNouveauLot() {
  const id  = `LOT-2026-0${state.lotCounter++}`
  const now = new Date()
  const lot = {
    id,
    date:      now.toLocaleDateString('fr-FR') + ' — ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    status:    null,
    photos:    12,
    scories:   0,
    duree:     null,
    confiance: null,
  }

  updateHeader({ status: 'SCANNING', lotId: id })
  navigate('analyse')
  mountAnalyse(lot)
}

// ── Window exports (for inline onclick handlers in HTML templates) ─

window.navigate      = navigate
window.viewRapport   = viewRapport
window.startNouveauLot = startNouveauLot
window.pauseAnalyse  = pauseAnalyse
window.stopAnalyse   = stopAnalyse
window.filterGallery = filterGallery
window.exportJSON    = exportJSON

// ── Boot ──────────────────────────────────────────────────────────

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => navigate(btn.dataset.nav))
})
document.getElementById('fab-new-lot')?.addEventListener('click', startNouveauLot)

navigate('dashboard')
