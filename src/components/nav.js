export function updateNav(screen) {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'))

  // Analyse is a transient screen — keep dashboard nav highlighted
  const target = screen === 'analyse' ? 'dashboard' : screen
  const active = document.querySelector(`.nav-btn[data-nav="${target}"]`)
  if (active) active.classList.add('active')
}
