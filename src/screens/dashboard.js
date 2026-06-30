import { state } from '../state.js'

export function renderDashboard() {
  const el = document.getElementById('screen-dashboard')
  if (!el) return

  const dateStr = new Date()
    .toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase()

  const conformes = state.lots.filter(l => l.status === 'CONFORME').length
  const nc        = state.lots.filter(l => l.status === 'NON-CONFORME').length

  el.innerHTML = `
    <div class="space-y-gutter">

      <!-- KPIs -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div class="md:col-span-3 flex items-center justify-between">
          <h2 class="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">today</span>Aujourd'hui
          </h2>
          <span class="font-data-md text-data-md text-on-surface-variant">${dateStr}</span>
        </div>
        ${kpiCard('TOTAL ANALYSÉ', state.lots.length, 'Lots',            'primary',   'analytics')}
        ${kpiCard('CONFORMES',     conformes,          'Approuvés',       'tertiary',  'check_circle')}
        ${kpiCard('NON-CONFORME',  nc,                 'Écarts détectés', 'secondary', 'warning')}
      </section>

      <!-- Flux temps réel -->
      <section class="relative h-20 w-full glass-panel rounded-xl overflow-hidden border-dashed border-outline flex items-center px-md gap-4">
        <span class="w-2 h-2 rounded-full bg-primary pulse-teal flex-shrink-0"></span>
        <span class="font-label-caps text-label-caps text-primary flex-shrink-0">FLUX TEMPS RÉEL</span>
        <div class="overflow-hidden flex-1">
          <div class="font-data-md text-data-md text-on-surface-variant whitespace-nowrap animate-pulse">
            En attente de connexion aux modèles YOLO/Ollama... — Station locale W8-42 — Prêt à recevoir des lots
          </div>
        </div>
      </section>

      <!-- Lots récents -->
      <section class="space-y-base">
        <div class="flex items-center justify-between pb-2 border-b border-outline-variant">
          <h2 class="font-headline-md text-headline-md text-on-surface">Lots Récents</h2>
          <button class="font-label-caps text-label-caps text-primary flex items-center gap-1 hover:underline">
            VOIR TOUT <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
        <div class="space-y-sm">
          ${state.lots.map(lotRow).join('')}
        </div>
      </section>

    </div>
  `
}

function kpiCard(label, value, unit, colorToken, icon) {
  return `
    <div class="glass-panel p-md rounded-xl flex flex-col justify-between min-h-[140px] hover:border-${colorToken} transition-colors group cursor-pointer">
      <div class="flex justify-between items-start">
        <span class="font-label-caps text-label-caps text-on-surface-variant">${label}</span>
        <span class="material-symbols-outlined text-${colorToken}/50 group-hover:text-${colorToken} transition-colors">${icon}</span>
      </div>
      <div class="mt-4">
        <span class="font-headline-xl text-headline-xl text-${colorToken}">${value}</span>
        <span class="font-body-md text-body-md text-on-surface-variant ml-2">${unit}</span>
      </div>
    </div>`
}

function lotRow(lot) {
  const ok = lot.status === 'CONFORME'
  const iconBg    = ok ? 'bg-tertiary/10 border-tertiary/20'   : 'bg-secondary/10 border-secondary/20'
  const iconColor = ok ? 'text-tertiary'                       : 'text-secondary'
  const badge     = ok ? 'bg-[#003824] text-tertiary border-tertiary/30' : 'bg-[#552100] text-secondary border-secondary/30'

  return `
    <div class="glass-panel p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-surface-variant/20 transition-all group fade-in">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded ${iconBg} flex items-center justify-center shrink-0 border">
          <span class="material-symbols-outlined ${iconColor}">inventory_2</span>
        </div>
        <div>
          <p class="font-data-lg text-data-lg text-on-surface group-hover:text-primary transition-colors">${lot.id}</p>
          <p class="font-data-md text-data-md text-on-surface-variant">${lot.date}</p>
        </div>
      </div>
      <div class="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
        <span class="px-3 py-1 font-data-md text-data-md rounded border ${badge}">${lot.status}</span>
        <button onclick="window.viewRapport('${lot.id}')"
          class="flex items-center gap-2 font-body-md text-body-md text-primary px-4 py-2 hover:bg-primary/10 rounded transition-colors border border-transparent hover:border-primary/20">
          Voir Rapport <span class="material-symbols-outlined text-[18px]">description</span>
        </button>
      </div>
    </div>`
}
