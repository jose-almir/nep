import ipe from './img/ipe.jpg'
import limao from './img/limao.jpg'
import girassol from './img/girassol.jpg'
import maracuja from './img/maracuja.jpg'

export const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

// ponytail: the four species from the concept image; swap for the team's real catalog when it arrives.
// `meses` uses 1–12.
export const especies = [
  { id: 'ipe-amarelo', nome: 'Ipê-amarelo', cientifico: 'Handroanthus ochraceus', floracao: 'agosto a outubro', meses: [8, 9, 10], foto: ipe, alt: 'Cacho de flores amarelas do ipê' },
  { id: 'limao', nome: 'Limão', cientifico: 'Citrus limon', floracao: 'setembro a novembro', meses: [9, 10, 11], foto: limao, alt: 'Flores brancas de limoeiro entre folhas' },
  { id: 'girassol', nome: 'Girassol', cientifico: 'Helianthus annuus', floracao: 'primavera e verão (setembro a março)', meses: [9, 10, 11, 12, 1, 2, 3], foto: girassol, alt: 'Girassol aberto visto de frente' },
  { id: 'maracuja', nome: 'Maracujá', cientifico: 'Passiflora edulis', floracao: 'o ano todo', meses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], foto: maracuja, alt: 'Flor roxa e branca do maracujá' },
]
