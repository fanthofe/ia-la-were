import { PHOTO_IMAGES } from '../data/lots.js'
import { state } from '../state.js'

export function renderRapport(lot) {
  if (!lot) return
  state.rapportLot = lot

  const el = document.getElementById('screen-rapport')
  if (!el) return

  el.innerHTML = template(lot)
}

export function filterGallery(filter, btn) {
  document.querySelectorAll('.gallery-filter').forEach(b => {
    b.className =
      'px-4 py-1.5 rounded hover:bg-surface-variant/30 text-on-surface-variant font-label-caps text-label-caps uppercase transition-colors gallery-filter'
  })
  btn.className =
    'px-4 py-1.5 rounded bg-primary-container text-on-primary-container font-label-caps text-label-caps uppercase gallery-filter'

  const grid = document.getElementById('gallery-grid')
  if (grid && state.rapportLot) grid.innerHTML = buildGallery(state.rapportLot, filter)
}

export function exportJSON() {
  const lot = state.rapportLot
  if (!lot) return

  const payload = {
    lot_id:              lot.id,
    analyzed_at:         new Date().toISOString(),
    lot_status:          lot.status,
    photos_count:        lot.photos,
    etiquettes_presentes: lot.photos,
    scories_detectees:   lot.scories,
    duree_analyse:       lot.duree,
    confiance_modele:    lot.confiance,
    model:               'yolo11s_v1',
  }

  const a    = document.createElement('a')
  a.href     = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }))
  a.download = `rapport_${lot.id}.json`
  a.click()
}

// ── Private ────────────────────────────────────────────────────────

function buildGallery(lot, filter) {
  const photos = Array.from({ length: lot.photos }, (_, i) => ({
    filename: `CAM_${String(i + 1).padStart(2, '0')}.jpg`,
    status:   (i === 3 && lot.scories > 0) ? 'NON-CONFORME' : 'CONFORME',
    src:      PHOTO_IMAGES[i % PHOTO_IMAGES.length],
  }))

  const visible = filter === 'all' ? photos : photos.filter(p => p.status === filter)

  if (!visible.length) {
    return `<div class="col-span-full text-center py-12 text-on-surface-variant font-body-md">
      Aucune photo dans cette catégorie.
    </div>`
  }

  return visible.map(p => {
    const ok    = p.status === 'CONFORME'
    const badge = ok ? 'bg-tertiary text-on-tertiary' : 'bg-error-container text-on-error-container'
    return `
      <div class="group relative aspect-square glass-panel rounded-lg overflow-hidden border border-outline-variant cursor-pointer hover:border-primary transition-all">
        <div class="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style="background-image: url('${p.src}')"></div>
        <div class="absolute top-2 right-2">
          <span class="${badge} font-label-caps text-[10px] px-2 py-0.5 rounded shadow-lg">
            ${ok ? 'CONFORME' : 'N-CONF'}
          </span>
        </div>
        <div class="absolute inset-x-0 bottom-0 p-2 bg-surface/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <p class="font-data-md text-[11px] text-primary truncate">${p.filename}</p>
        </div>
      </div>`
  }).join('')
}

function telemetryRow(param, val, tol, pass) {
  const badge = pass
    ? `<span class="bg-tertiary/20 text-tertiary font-label-caps text-[11px] px-3 py-1 rounded border border-tertiary/30">PASS</span>`
    : `<span class="bg-error/20 text-error font-label-caps text-[11px] px-3 py-1 rounded border border-error/30">FAIL</span>`
  return `
    <tr>
      <td class="px-gutter py-4 font-body-md">${param}</td>
      <td class="px-gutter py-4 font-data-md">${val}</td>
      <td class="px-gutter py-4 font-data-md text-secondary">${tol}</td>
      <td class="px-gutter py-4 text-right">${badge}</td>
    </tr>`
}

function template(lot) {
  const ok = lot.status === 'CONFORME'

  const badge = ok
    ? `<div class="flex items-center gap-3 px-6 py-3 rounded-lg border bg-tertiary-container border-tertiary">
        <span class="material-symbols-outlined text-on-tertiary-container" style="font-variation-settings:'FILL' 1;">verified</span>
        <span class="font-headline-md text-headline-md text-on-tertiary-container font-bold">CONFORME</span>
       </div>`
    : `<div class="flex items-center gap-3 px-6 py-3 rounded-lg border bg-error-container border-error">
        <span class="material-symbols-outlined text-on-error-container" style="font-variation-settings:'FILL' 1;">error</span>
        <span class="font-headline-md text-headline-md text-on-error-container font-bold">NON-CONFORME</span>
       </div>`

  const scorieMeta = lot.scories > 0
    ? { bg: 'bg-secondary/10', color: 'text-secondary' }
    : { bg: 'bg-on-surface-variant/10', color: 'text-on-surface-variant' }

  const telemetry = [
    { param: 'Alignement Étiquette A1',    val: '0.02mm offset', tol: '± 0.15mm',    pass: true },
    { param: 'Présence Logo Constructeur', val: 'Détecté',        tol: 'Obligatoire', pass: true },
    {
      param: 'Analyse Surface (Scories)',
      val:   lot.scories > 0 ? `${lot.scories} zone(s)` : 'Néant',
      tol:   '< 1% total',
      pass:  lot.scories === 0,
    },
  ]

  return `
    <div class="space-y-gutter">

      <!-- Hero -->
      <section class="glass-panel rounded-xl p-gutter relative overflow-hidden">
        <div class="absolute top-0 right-0 p-gutter opacity-10">
          <span class="material-symbols-outlined text-[120px]">${ok ? 'check_circle' : 'warning'}</span>
        </div>
        <div class="relative z-10 space-y-4">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-1">Rapport de Lot Détaillé</p>
              <h1 class="font-headline-xl text-headline-xl text-primary leading-none">${lot.id}</h1>
            </div>
            ${badge}
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-outline-variant">
            <div class="flex flex-col">
              <span class="font-label-caps text-label-caps text-outline">Date d'Analyse</span>
              <span class="font-data-lg text-data-lg">${lot.date}</span>
            </div>
            <div class="flex flex-col">
              <span class="font-label-caps text-label-caps text-outline">Station</span>
              <span class="font-data-lg text-data-lg">Station_A42</span>
            </div>
            <div class="flex flex-col">
              <span class="font-label-caps text-label-caps text-outline">Temps Total</span>
              <span class="font-data-lg text-data-lg">${lot.duree ?? '—'}</span>
            </div>
            <div class="flex flex-col">
              <span class="font-label-caps text-label-caps text-outline">Modèle IA</span>
              <span class="font-data-lg text-data-lg">YOLO11s v1</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Métriques -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div class="glass-panel rounded-xl p-gutter flex items-center gap-gutter industrial-glow transition-all">
          <div class="bg-primary/10 p-4 rounded-full">
            <span class="material-symbols-outlined text-primary text-3xl">photo_library</span>
          </div>
          <div>
            <h3 class="font-headline-lg text-headline-lg leading-none">${lot.photos}</h3>
            <p class="text-on-surface-variant font-label-caps text-label-caps uppercase">Photos Analysées</p>
          </div>
        </div>
        <div class="glass-panel rounded-xl p-gutter flex items-center gap-gutter industrial-glow transition-all">
          <div class="bg-tertiary/10 p-4 rounded-full">
            <span class="material-symbols-outlined text-tertiary text-3xl">label</span>
          </div>
          <div>
            <h3 class="font-headline-lg text-headline-lg leading-none">${lot.photos}</h3>
            <p class="text-on-surface-variant font-label-caps text-label-caps uppercase">Étiquettes Présentes</p>
          </div>
        </div>
        <div class="glass-panel rounded-xl p-gutter flex items-center gap-gutter industrial-glow transition-all">
          <div class="${scorieMeta.bg} p-4 rounded-full">
            <span class="material-symbols-outlined ${scorieMeta.color} text-3xl">biotech</span>
          </div>
          <div>
            <h3 class="font-headline-lg text-headline-lg leading-none">${lot.scories}</h3>
            <p class="text-on-surface-variant font-label-caps text-label-caps uppercase">Scories Détectées</p>
          </div>
        </div>
      </section>

      <!-- Galerie -->
      <section class="space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">grid_view</span>
            <h2 class="font-headline-md text-headline-md">Galerie d'Inspection</h2>
          </div>
          <div class="flex gap-2 p-1 bg-surface-container rounded-lg border border-outline-variant overflow-x-auto no-scrollbar">
            <button onclick="window.filterGallery('all', this)"
              class="px-4 py-1.5 rounded bg-primary-container text-on-primary-container font-label-caps text-label-caps uppercase gallery-filter">Tout</button>
            <button onclick="window.filterGallery('CONFORME', this)"
              class="px-4 py-1.5 rounded hover:bg-surface-variant/30 text-on-surface-variant font-label-caps text-label-caps uppercase transition-colors gallery-filter">Conforme</button>
            <button onclick="window.filterGallery('NON-CONFORME', this)"
              class="px-4 py-1.5 rounded hover:bg-surface-variant/30 text-on-surface-variant font-label-caps text-label-caps uppercase transition-colors gallery-filter">Non-conforme</button>
            <button onclick="window.filterGallery('VERIFICATION', this)"
              class="px-4 py-1.5 rounded hover:bg-surface-variant/30 text-on-surface-variant font-label-caps text-label-caps uppercase transition-colors gallery-filter">À vérifier</button>
          </div>
        </div>
        <div id="gallery-grid" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          ${buildGallery(lot, 'all')}
        </div>
      </section>

      <!-- Télémétrie -->
      <section class="glass-panel rounded-xl overflow-hidden">
        <div class="px-gutter py-4 border-b border-outline-variant flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">analytics</span>
            <h2 class="font-headline-md text-headline-md">Détails de Télémétrie IA</h2>
          </div>
          <span class="font-data-md text-data-md text-on-surface-variant">Confiance : ${lot.confiance ?? '—'}</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-surface-variant/20">
                <th class="px-gutter py-4 font-label-caps text-label-caps text-outline uppercase">Paramètre</th>
                <th class="px-gutter py-4 font-label-caps text-label-caps text-outline uppercase">Valeur Détectée</th>
                <th class="px-gutter py-4 font-label-caps text-label-caps text-outline uppercase">Tolérance</th>
                <th class="px-gutter py-4 font-label-caps text-label-caps text-outline uppercase text-right">Statut</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant">
              ${telemetry.map(r => telemetryRow(r.param, r.val, r.tol, r.pass)).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <!-- Actions -->
      <section class="flex flex-col md:flex-row gap-4 pt-4">
        <button onclick="window.exportJSON()"
          class="flex-1 flex items-center justify-center gap-2 bg-primary text-on-primary font-bold py-4 rounded-lg industrial-glow transition-transform active:scale-95">
          <span class="material-symbols-outlined">download</span>Exporter le Rapport (JSON)
        </button>
        <button onclick="window.navigate('dashboard')"
          class="flex-1 flex items-center justify-center gap-2 border border-outline text-on-surface font-bold py-4 rounded-lg hover:bg-surface-variant/20 transition-all">
          <span class="material-symbols-outlined">arrow_back</span>Retour au Tableau de Bord
        </button>
      </section>

    </div>
  `
}
