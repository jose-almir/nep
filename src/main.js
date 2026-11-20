import '@fontsource-variable/nunito'
import '@fontsource/caveat/700.css'
import './style.css'
import { createIcons, House, Flower2, MapPin, Info, Mail, Menu, X, Search, ChevronRight, CalendarDays, Leaf, Check, ShieldCheck, TreeDeciduous, Ban, Recycle, Heart } from 'lucide'
import { especies, MESES } from './especies.js'

const icons = { House, Flower2, MapPin, Info, Mail, Menu, X, Search, ChevronRight, CalendarDays, Leaf, Check, ShieldCheck, TreeDeciduous, Ban, Recycle, Heart }
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
const espiao = new IntersectionObserver(
  (entradas) => {
    for (const e of entradas) {
      if (e.isIntersecting) links.forEach((a) => a.setAttribute('aria-current', a.hash === `#${e.target.id}`))
    }
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
      <img src="${e.foto}" alt="${e.alt}" width="350" height="140" loading="lazy" class="aspect-[5/2] w-full object-cover" />
      <div class="flex flex-1 flex-col px-4 pb-5 text-center">
        <h3 class="relative mx-auto -mt-5 rounded-lg bg-mel px-4 py-1 text-lg font-extrabold lg:text-xl">${e.nome}</h3>
        <p class="mt-1 text-tinta/75 italic">${e.cientifico}</p>
        <p class="mt-3 text-sm text-balance"><i data-lucide="calendar-days" class="mr-1 inline size-4 align-[-3px]"></i><b>Floração:</b> ${e.floracao}</p>
        <div class="mt-auto">${faixaMeses(e.meses)}</div>
      </div>
    </article>
  </li>`
}

const linhaCalendario = (e) => `
  <tr>
    <th scope="row" class="truncate pr-2 text-left font-bold">${e.nome}</th>
    ${MESES.map((_, i) => `<td class="h-7 rounded-md ${celula(e.meses.includes(i + 1), i + 1)}">${e.meses.includes(i + 1) ? '<span class="sr-only">floresce</span>' : ''}</td>`).join('')}
  </tr>`

const marcadorMais = `
  <li data-pendente class="x-box min-h-24 sm:col-span-full" style="view-transition-name: esp-mais">
    <span class="x-box-rotulo">Mais espécies do levantamento · a definir</span>
  </li>`

function renderizar() {
  const termo = semAcento(filtro.texto.trim())
  const visiveis = especies.filter(
    (e) => semAcento(`${e.nome} ${e.cientifico}`).includes(termo) && (!filtro.mes || e.meses.includes(filtro.mes)),
  )
  const filtrando = termo || filtro.mes
  $('#lista-especies').innerHTML = visiveis.map(cartao).join('') + (filtrando ? '' : marcadorMais)
  $('#calendario tbody').innerHTML = visiveis.map(linhaCalendario).join('')
  $('#calendario').parentElement.classList.toggle('hidden', !visiveis.length)
  $('#vazio').classList.toggle('hidden', visiveis.length > 0)
  const n = visiveis.length
  $('#contagem').textContent =
    (n === 1 ? '1 espécie' : `${n} espécies`) + (filtro.mes ? ` florescendo em ${MESES[filtro.mes - 1]}` : '')
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
$('#limpar').addEventListener('click', () => {
  $('#busca').value = ''
  atualizar({ texto: '', mes: 0 })
})

renderizar()
