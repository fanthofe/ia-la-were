import { LOG_SEQUENCE } from '../data/lots.js'
import { state } from '../state.js'
import { updateHeader } from '../components/header.js'

let analysisInterval = null
let paused = false

export function mountAnalyse(lot) {
  const el = document.getElementById('screen-analyse')
  if (!el) return

  paused = false
  el.innerHTML = template(lot)

  document.getElementById('hud-time').textContent =
    new Date().toISOString().replace('T', ' ').slice(0, 23)

  runAnalysis(lot)
}

export function pauseAnalyse() {
  paused = !paused
  const btn = document.getElementById('btn-pause')
  if (!btn) return
  btn.querySelector('.material-symbols-outlined').textContent = paused ? 'play_arrow' : 'pause'
  btn.querySelector('.btn-label').textContent = paused ? 'Reprendre' : 'Pause'
}

export function stopAnalyse() {
  clearInterval(analysisInterval)
  updateHeader({ status: 'IDLE', lotId: null })
  window.navigate('dashboard')
}

// ── Private ────────────────────────────────────────────────────────

function runAnalysis(lot) {
  clearInterval(analysisInterval)
  let progress = 0
  const total = lot.photos

  // Scheduled console logs
  LOG_SEQUENCE.forEach(({ delay, color, prefix, msg }) => {
    setTimeout(() => {
      if (document.getElementById('log-stream')) addLog(color, prefix, msg)
    }, delay)
  })

  // GPU stats (appear after warm-up)
  setTimeout(() => {
    const latEl  = document.getElementById('stat-latence')
    const tempEl = document.getElementById('stat-temp')
    if (latEl)  latEl.textContent  = (Math.random() * 20 + 35).toFixed(0) + 'ms'
    if (tempEl) tempEl.textContent = (Math.random() * 10 + 58).toFixed(0) + '°C'
  }, 1500)

  // Bounding box reveal
  setTimeout(() => {
    document.getElementById('bbox-label')?.classList.remove('hidden')
  }, 2000)

  // Progress ticker
  analysisInterval = setInterval(() => {
    if (paused) return

    progress = Math.min(progress + Math.random() * 2.5 + 1.5, 100)
    const processed = Math.floor((progress / 100) * total)

    document.getElementById('progress-bar')?.style.setProperty('width', progress + '%')
    const pctEl = document.getElementById('analyse-pct')
    if (pctEl) pctEl.innerHTML =
      `${Math.floor(progress)}% <span class="text-on-surface-variant text-body-md">COMPLÉTÉ</span>`
    const cntEl = document.getElementById('analyse-count')
    if (cntEl) cntEl.textContent = `${processed} / ${total} Photos traitées`
    const hudEl = document.getElementById('hud-time')
    if (hudEl) hudEl.textContent = new Date().toISOString().replace('T', ' ').slice(0, 23)

    if (progress >= 100) {
      clearInterval(analysisInterval)
      finishAnalysis(lot)
    }
  }, 400)
}

function finishAnalysis(lot) {
  lot.status    = 'CONFORME'
  lot.duree     = (Math.random() * 5 + 10).toFixed(1) + 's'
  lot.confiance = (Math.random() * 3 + 96).toFixed(1) + '%'
  lot.scories   = 0
  state.lots.unshift(lot)
  state.rapportLot = lot

  addLog('text-tertiary', 'SYSTEM:', 'Analyse terminée — statut : CONFORME')
  updateHeader({ status: 'IDLE', lotId: lot.id })

  setTimeout(() => {
    if (document.getElementById('screen-analyse')?.classList.contains('active')) {
      window.navigate('rapport')
    }
  }, 1200)
}

function addLog(color, prefix, msg) {
  const stream = document.getElementById('log-stream')
  if (!stream) return

  const now = new Date()
  const ts  = `[${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}]`

  const entry = document.createElement('div')
  entry.className = 'flex gap-2 fade-in'
  entry.innerHTML = `
    <span class="text-on-surface-variant opacity-50 flex-shrink-0">${ts}</span>
    <span class="flex-shrink-0 ${color}">${prefix}</span>
    <span class="text-on-surface">${msg}</span>`
  stream.appendChild(entry)
  stream.scrollTop = stream.scrollHeight
}

const pad = n => String(n).padStart(2, '0')

// ── Template ────────────────────────────────────────────────────────

function template(lot) {
  return `
    <div class="space-y-gutter">

      <!-- Progress bar -->
      <section class="glass-panel p-6 rounded-lg">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
          <div>
            <span class="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1 block">Statut de la session</span>
            <h2 class="font-headline-md text-headline-md text-primary">Analyse en cours : ${lot.id}</h2>
          </div>
          <div class="text-right">
            <span id="analyse-pct" class="font-data-lg text-data-lg text-primary">0% <span class="text-on-surface-variant text-body-md">COMPLÉTÉ</span></span>
            <p id="analyse-count" class="font-data-md text-data-md text-on-surface-variant">0 / ${lot.photos} Photos traitées</p>
          </div>
        </div>
        <div class="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
          <div id="progress-bar" class="bg-primary h-full transition-all duration-700 ease-in-out shadow-[0_0_8px_rgba(107,216,203,.5)]" style="width:0%"></div>
        </div>
      </section>

      <!-- Live feed + console -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter">

        <!-- Camera feed -->
        <div class="lg:col-span-8">
          <div class="glass-panel rounded-lg overflow-hidden relative aspect-video">
            <div class="absolute inset-0 bg-surface-container-lowest">
              <div class="relative w-full h-full">
                <img class="w-full h-full object-cover opacity-80"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_s7DCe_SqBA94HDscIQu5H8Qf5Q_Jbl4jOS4CVSpK4S1N2v67fylRpZzriS2goFdbXSKoWmzRjajt1hhM853nID2TnlcYrHlgqH0bKFiZ3X_aiN6T2tjc52mziJP2IMDojXfVzMHZeS8yOg4AHkmiPSNXvEA1D_jbJr7ZzTlWch1y52HQBqKbwieFiaANw30mlxsyN_H59c6JLW6sr2LEQdUBnC6AnJxnClpfKpCNam3-_M4WeQ"
                  alt="Flux caméra"/>

                <!-- Bounding boxes -->
                <div id="bbox-label" class="absolute top-[20%] left-[30%] w-[150px] h-[100px] border-2 border-primary pulse-teal pointer-events-none hidden">
                  <span class="absolute -top-6 left-0 bg-primary text-on-primary text-[10px] font-label-caps px-1">LBL_TAG (94%)</span>
                </div>
                <div id="bbox-scorie" class="absolute top-[45%] left-[55%] w-[80px] h-[80px] border-2 border-error pointer-events-none hidden">
                  <span class="absolute -top-6 left-0 bg-error text-on-error text-[10px] font-label-caps px-1">SCORIE_DETECTED</span>
                </div>

                <div class="scan-line"></div>

                <!-- HUD overlays -->
                <div class="absolute top-4 left-4">
                  <div class="bg-primary/20 backdrop-blur-md px-2 py-1 border border-primary/30 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span class="font-label-caps text-label-caps text-primary">LIVE FEED : CAM_01</span>
                  </div>
                </div>
                <div class="absolute bottom-4 right-4 text-right">
                  <p class="font-data-md text-data-md text-primary/70">ISO 400 | f/2.8 | 1/500s</p>
                  <p id="hud-time" class="font-data-md text-data-md text-primary/70"></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Console + GPU stats -->
        <div class="lg:col-span-4 flex flex-col gap-gutter">
          <div class="glass-panel flex-1 rounded-lg p-4 flex flex-col min-h-[260px]">
            <div class="flex items-center justify-between mb-4 border-b border-outline-variant pb-2">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-sm">terminal</span>
                <span class="font-label-caps text-label-caps text-on-surface-variant">CONSOLE LOGS</span>
              </div>
              <span class="w-2 h-2 rounded-full bg-primary pulse-teal"></span>
            </div>
            <div id="log-stream" class="log-stream flex-1 overflow-y-auto space-y-2 font-data-md text-data-md"></div>
          </div>
          <div class="glass-panel rounded-lg p-4 grid grid-cols-2 gap-4">
            <div class="border-l-2 border-primary pl-3">
              <p class="font-label-caps text-label-caps text-on-surface-variant">LATENCE GPU</p>
              <p id="stat-latence" class="font-data-lg text-data-lg text-on-surface">—</p>
            </div>
            <div class="border-l-2 border-secondary pl-3">
              <p class="font-label-caps text-label-caps text-on-surface-variant">TEMPÉRATURE</p>
              <p id="stat-temp" class="font-data-lg text-data-lg text-on-surface">—</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center py-6">
        <button id="btn-pause" onclick="window.pauseAnalyse()"
          class="w-full sm:w-auto px-10 h-14 bg-surface-container-high border border-outline-variant text-on-surface hover:bg-surface-variant/30 transition-all flex items-center justify-center gap-3 rounded-lg group">
          <span class="material-symbols-outlined group-active:scale-90 transition-transform">pause</span>
          <span class="btn-label font-headline-md text-[18px]">Pause</span>
        </button>
        <button onclick="window.stopAnalyse()"
          class="w-full sm:w-auto px-10 h-14 bg-error-container text-on-error-container hover:brightness-110 transition-all flex items-center justify-center gap-3 rounded-lg group">
          <span class="material-symbols-outlined group-active:scale-90 transition-transform">stop</span>
          <span class="font-headline-md text-[18px]">Arrêter</span>
        </button>
      </div>

    </div>
  `
}
