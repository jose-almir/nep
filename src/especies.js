import ipe from './img/ipe.webp'
import limao from './img/limao.webp'
import girassol from './img/girassol.webp'
import maracuja from './img/maracuja.webp'

export const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

// Repeats one petal path n times around the icon center (24×24 viewBox).
const petalas = (d, n) => Array.from({ length: n }, (_, i) => `<path d="${d}" transform="rotate(${(360 / n) * i} 12 12)"/>`).join('')

// Simple stroke icons for the calendar, in the same style as the Lucide icons used elsewhere.
const ICONES = {
  ipe: '<path d="M12 22v-6"/><path d="M10.5 16 7.5 7.5h9l-3 8.5z"/><path d="M7.5 7.5C5.6 6.6 5.8 3.8 8 3.6c.8-1.8 7.2-1.8 8 0 2.2.2 2.4 3 .5 3.9"/>',
  limao: petalas('M12 9.5c-1.5-2.4-1.5-5 0-7.5 1.5 2.5 1.5 5.1 0 7.5z', 5) + '<circle cx="12" cy="12" r="1.5"/>',
  girassol: petalas('M12 7.5c-1.4-1.6-1.4-3.6 0-5.5 1.4 1.9 1.4 3.9 0 5.5z', 8) + '<circle cx="12" cy="12" r="3.5"/>',
  maracuja: '<circle cx="12" cy="12" r="9.5"/>' + petalas('M12 4.5v3.5', 12) + '<circle cx="12" cy="12" r="1.5"/>',
}

// ponytail: the four species from the concept image; swap for the team's real catalog when it arrives.
// `meses` uses 1–12.
export const especies = [
  { id: 'ipe-amarelo', nome: 'Ipê-amarelo', cientifico: 'Handroanthus ochraceus', floracao: 'agosto a outubro', meses: [8, 9, 10], foto: ipe, icone: ICONES.ipe, credito: { autor: 'Mateus Hidalgo', licenca: 'CC BY-SA 2.5', fonte: 'https://commons.wikimedia.org/wiki/File:Flores_de_ip%C3%AA-amarelo.jpg' }, alt: 'Cacho de flores amarelas do ipê' },
  { id: 'limao', nome: 'Limão', cientifico: 'Citrus limon', floracao: 'setembro a novembro', meses: [9, 10, 11], foto: limao, icone: ICONES.limao, credito: { autor: 'Ermell', licenca: 'CC BY-SA 4.0', fonte: 'https://commons.wikimedia.org/wiki/File:Citrus_flower_2019-06-13_09-54-06_(C)-PSD.jpg' }, alt: 'Flor branca de limoeiro aberta' },
  { id: 'girassol', nome: 'Girassol', cientifico: 'Helianthus annuus', floracao: 'primavera e verão (setembro a março)', meses: [9, 10, 11, 12, 1, 2, 3], foto: girassol, icone: ICONES.girassol, credito: { autor: 'George Chernilevsky', licenca: 'CC BY 4.0', fonte: 'https://commons.wikimedia.org/wiki/File:Sunflower_head_2026_G1.jpg' }, alt: 'Girassol aberto visto de frente' },
  { id: 'maracuja', nome: 'Maracujá', cientifico: 'Passiflora edulis', floracao: 'o ano todo', meses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], foto: maracuja, icone: ICONES.maracuja, credito: { autor: 'Earth100', licenca: 'CC BY-SA 3.0', fonte: 'https://commons.wikimedia.org/wiki/File:Passiflora_edulis_flower_in_Hong_Kong_Mar_9_2013.JPG' }, alt: 'Flor roxa e branca do maracujá' },
]
