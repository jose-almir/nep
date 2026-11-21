import '@fontsource-variable/nunito'
import '@fontsource/caveat/700.css'
import 'leaflet/dist/leaflet.css'
import './style.css'
import L from 'leaflet'
import { createIcons, House, Flower2, MapPin, Info, Mail, Menu, X, Search, ChevronRight, CalendarDays, Leaf, Check, ShieldCheck, TreeDeciduous, Ban, Recycle, Heart, Construction } from 'lucide'
import { especies, MESES } from './especies.js'
import { pontos, PONTOS_DE_EXEMPLO } from './pontos.js'

const icons = { House, Flower2, MapPin, Info, Mail, Menu, X, Search, ChevronRight, CalendarDays, Leaf, Check, ShieldCheck, TreeDeciduous, Ban, Recycle, Heart, Construction }
const desenharIcones = () => createIcons({ icons, attrs: { 'aria-hidden': 'true' } })

const $ = (s) => document.querySelector(s)
const mesAtual = new Date().getMonth() + 1
const semAcento = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/* ---------- Menu (mobile) ---------- */
const menuBtn = $('#menu-btn')
const menu = $('#menu')
function abrirMenu(aberto) {
  menuBtn.setAttribute('aria-expanded', aberto)
  menu.classList.toggle('hidden', !aberto)
  menuBtn.querySelector('svg').outerHTML = `<i data-lucide="${aberto ? 'x' : 'menu'}"></i>`
  desenharIcones()
}
menuBtn.addEventListener('click', () => abrirMenu(menuBtn.getAttribute('aria-expanded') !== 'true'))
menu.addEventListener('click', (e) => e.target.closest('a') && menuBtn.offsetParent && abrirMenu(false))
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
    abrirMenu(false)
    menuBtn.focus()
  }
})

/* ---------- Link ativo conforme a rolagem ---------- */
const links = [...menu.querySelectorAll('a')]
// #mapas sits inside #flores, so track every target in the band and mark the last one in menu order (the innermost).
const naFaixa = new Set()
const espiao = new IntersectionObserver(
  (entradas) => {
    for (const e of entradas) e.isIntersecting ? naFaixa.add(`#${e.target.id}`) : naFaixa.delete(`#${e.target.id}`)
    const atual = links.findLast((a) => naFaixa.has(a.hash))
    if (atual) links.forEach((a) => a.setAttribute('aria-current', a === atual))
  },
  { rootMargin: '-45% 0px -50% 0px' },
)
links.forEach((a) => espiao.observe(document.getElementById(a.hash.slice(1))))

/* ---------- Espécies: busca + filtro por mês ---------- */
// ?mes=12 opens the page already filtered (useful for a QR code at the event).
const mesDaUrl = Number(new URLSearchParams(location.search).get('mes'))
const filtro = { texto: '', mes: mesDaUrl >= 1 && mesDaUrl <= 12 ? mesDaUrl : 0 } // mes 0 = todos

const MARCA_HOJE = 'ring-2 ring-tinta ring-offset-1 ring-offset-favo'
const celula = (floresce, n) =>
  `${floresce ? 'bg-mel text-tinta' : 'bg-tinta/[0.06] text-tinta/60'}${n === mesAtual ? ` ${MARCA_HOJE}` : ''}`

function faixaMeses(meses) {
  const celulas = MESES.map(
    (m, i) => `<span class="grid h-7 place-items-center rounded-md text-xs font-extrabold uppercase ${celula(meses.includes(i + 1), i + 1)}">${m[0]}</span>`,
  ).join('')
  const nomes = meses.length === 12 ? 'todos os meses' : meses.map((n) => MESES[n - 1]).join(', ')
  return `<div class="mt-4 grid grid-cols-12 gap-1" role="img" aria-label="Floresce em ${nomes}">${celulas}</div>`
}

function cartao(e) {
  return `
  <li style="view-transition-name: esp-${e.id}">
    <article class="flex h-full flex-col overflow-hidden rounded-2xl border border-tinta/10 bg-favo">
      <div class="relative">
        <img src="${e.foto}" alt="${e.alt}" width="1000" height="400" loading="lazy" class="aspect-[5/2] w-full object-cover" />
        <a href="${e.credito.fonte}" target="_blank" rel="noopener" class="credito top-1.5 right-1.5" title="Ver foto original e licença">© ${e.credito.autor} · ${e.credito.licenca}<span class="sr-only"> (abre em nova aba)</span></a>
      </div>
      <div class="flex flex-1 flex-col px-4 pb-5 text-center">
        <h3 class="relative mx-auto -mt-5 rounded-lg bg-mel px-4 py-1 text-lg font-extrabold lg:text-xl">${e.nome}</h3>
        <p class="mt-1 text-tinta/75 italic">${e.cientifico}</p>
        <p class="mt-3 text-sm text-balance"><i data-lucide="calendar-days" class="mr-1 inline size-4 align-[-3px]"></i><b>Floração:</b> ${e.floracao}</p>
        <div class="mt-auto">${faixaMeses(e.meses)}</div>
      </div>
    </article>
  </li>`
}

const iconeSvg = (e, classe) =>
  `<svg viewBox="0 0 24 24" class="${classe}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e.icone}</svg>`

const linhaCalendario = (e) => `
  <tr>
    <th scope="row" class="truncate pr-2 text-left font-bold">${iconeSvg(e, 'mr-1.5 inline size-4 align-[-3px]')}${e.nome}</th>
    ${MESES.map((_, i) => `<td class="h-7 rounded-md ${celula(e.meses.includes(i + 1), i + 1)}">${e.meses.includes(i + 1) ? '<span class="sr-only">floresce</span>' : ''}</td>`).join('')}
  </tr>`

/* ---------- Mapa ---------- */
const mapa = L.map('mapa', { dragging: !L.Browser.mobile }) // phones: one finger scrolls the page, not the map
const ruas = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(mapa)
const satelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19,
  maxNativeZoom: 17, // Esri serves a "no data" tile above z17 around Ubajara; upscale z17 instead
  attribution: 'Imagens &copy; Esri, Maxar, Earthstar Geographics e comunidade de usuários GIS',
})
L.control.layers({ Ruas: ruas, 'Satélite': satelite }).addTo(mapa)
L.control.scale({ imperial: false }).addTo(mapa)
mapa.fitBounds(pontos.map((p) => [p.lat, p.lng]), { padding: [40, 40] })
const camadaPontos = L.layerGroup().addTo(mapa)
$('#mapa-exemplo').classList.toggle('hidden', !PONTOS_DE_EXEMPLO)

const pontosDe = (e) => pontos.filter((p) => p.especie === e.id).map((p) => [p.lat, p.lng])
function enquadrar(latlngs) {
  if (!latlngs.length) return
  mapa.fitBounds(latlngs, { padding: [40, 40], maxZoom: 15 })
  $('#mapa').scrollIntoView({ block: 'nearest' }) // on phones the list sits below the map
}

// Legend + text alternative to the map: one button per visible species.
function itemLegenda(e) {
  const n = pontosDe(e).length
  return `<li><button type="button" data-especie="${e.id}" ${n ? '' : 'disabled'} class="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-mel/30 disabled:opacity-60 disabled:hover:bg-transparent">
    <span class="marcador size-9 shrink-0">${iconeSvg(e, 'size-5')}</span>
    <span class="flex-1"><span class="block font-bold">${e.nome}</span><span class="block text-sm text-tinta/75">${n ? (n === 1 ? '1 ponto' : `${n} pontos`) : 'nenhum ponto ainda'}</span></span>
    ${n ? '<i data-lucide="chevron-right" class="size-5 shrink-0"></i>' : ''}
  </button></li>`
}

function atualizarMapa(visiveis) {
  camadaPontos.clearLayers()
  for (const p of pontos) {
    const e = visiveis.find((v) => v.id === p.especie)
    if (!e) continue
    L.marker([p.lat, p.lng], {
      title: e.nome,
      icon: L.divIcon({ className: 'marcador', html: iconeSvg(e, 'size-5'), iconSize: [36, 36] }),
    })
      .bindPopup(`<b>${e.nome}</b><br><i>${e.cientifico}</i><br>Floração: ${e.floracao}${PONTOS_DE_EXEMPLO ? '<br><small>Ponto fictício (exemplo)</small>' : ''}`)
      .addTo(camadaPontos)
  }
}

let ultimasVisiveis = especies
function renderizar() {
  const termo = semAcento(filtro.texto.trim())
  const visiveis = especies.filter(
    (e) => semAcento(`${e.nome} ${e.cientifico}`).includes(termo) && (!filtro.mes || e.meses.includes(filtro.mes)),
  )
  $('#lista-especies').innerHTML = visiveis.map(cartao).join('')
  $('#calendario tbody').innerHTML = visiveis.map(linhaCalendario).join('')
  atualizarMapa(visiveis)
  $('#legenda-mapa').innerHTML = visiveis.length ? visiveis.map(itemLegenda).join('') : '<li class="px-2 py-1.5 text-sm text-tinta/75">Nenhuma espécie com esses filtros.</li>'
  $('#ver-todos').hidden = !visiveis.length
  ultimasVisiveis = visiveis
  $('#calendario').parentElement.classList.toggle('hidden', !visiveis.length)
  $('#vazio').classList.toggle('hidden', visiveis.length > 0)
  const n = visiveis.length
  $('#contagem').textContent =
    (n === 1 ? '1 espécie' : `${n} espécies`) + (filtro.mes ? ` florescendo em ${MESES[filtro.mes - 1]}` : '')
  // The map repeats the active filter so nobody has to scroll back up to know what it shows.
  const filtrando = termo || filtro.mes
  $('#mapa-estado').innerHTML =
    `<b>${filtro.mes ? `Florescendo em ${MESES[filtro.mes - 1]}` : 'Todas as espécies'}</b>` +
    (termo ? ` · busca “${filtro.texto.trim().replace(/[<>&"]/g, '')}”` : '') +
    (filtrando ? ` · ${n === 1 ? '1 espécie' : `${n} espécies`}` : '')
  $('#mapa-limpar').hidden = !filtrando
  document.querySelectorAll('#meses .chip').forEach((c) => c.setAttribute('aria-pressed', Number(c.value) === filtro.mes))
  document.querySelectorAll('#calendario thead th[data-mes]').forEach((th) => {
    th.classList.toggle('bg-tinta', Number(th.dataset.mes) === filtro.mes)
    th.classList.toggle('text-mel', Number(th.dataset.mes) === filtro.mes)
  })
  desenharIcones()
}

function atualizar(mudanca) {
  Object.assign(filtro, mudanca)
  const url = new URL(location)
  filtro.mes ? url.searchParams.set('mes', filtro.mes) : url.searchParams.delete('mes')
  history.replaceState(null, '', url)
  const animar = document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches
  animar ? document.startViewTransition(renderizar) : renderizar()
}

// Shortcuts span half the mobile grid; months fill two rows of six below them.
const chip = (valor, rotulo, extra = '') =>
  `<button type="button" class="chip ${extra}" value="${valor}" aria-pressed="false">${rotulo}</button>`
$('#meses').innerHTML = [
  chip(0, 'Todos', 'col-span-3'),
  chip(mesAtual, `Agora: ${MESES[mesAtual - 1]}`, 'col-span-3 normal-case'),
  ...MESES.map((m, i) =>
    chip(i + 1, `${m.slice(0, 3)}<span class="sr-only">${m.slice(3)}</span>`, i + 1 === mesAtual ? 'ring-2 ring-tinta ring-offset-2' : ''),
  ),
].join('')

$('#calendario thead tr').innerHTML =
  '<th scope="col" class="px-1 text-left text-xs font-bold text-tinta/75">Espécie</th>' +
  MESES.map(
    (m, i) =>
      `<th scope="col" data-mes="${i + 1}" aria-label="${m}" class="rounded-md py-1 text-xs font-extrabold uppercase"><span class="sm:hidden">${m[0]}</span><span class="hidden sm:inline">${m.slice(0, 3)}</span></th>`,
  ).join('')

$('#nome-mes-atual').textContent = MESES[mesAtual - 1]

$('#meses').addEventListener('click', (e) => {
  const alvo = e.target.closest('.chip')
  if (alvo) atualizar({ mes: Number(alvo.value) })
})
$('#busca').addEventListener('input', (e) => atualizar({ texto: e.target.value }))
function limparFiltros() {
  $('#busca').value = ''
  atualizar({ texto: '', mes: 0 })
}
$('#limpar').addEventListener('click', limparFiltros)
$('#mapa-limpar').addEventListener('click', limparFiltros)

$('#legenda-mapa').addEventListener('click', (ev) => {
  const e = especies.find((x) => x.id === ev.target.closest('button[data-especie]')?.dataset.especie)
  if (e) enquadrar(pontosDe(e))
})
$('#ver-todos').addEventListener('click', () => enquadrar(ultimasVisiveis.flatMap(pontosDe)))

renderizar()
