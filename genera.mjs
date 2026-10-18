/* =====================================================================
   GENERATORE DELLE PAGINE — riscrive l'HTML leggendo contenuti.json
   =====================================================================

   Cosa fa
       prende tutti i testi da contenuti.json e li riscrive dentro
       index.html, prestazioni.html, domande.html, privacy.html e
       404.html. Poi:
         - scrive le pagine "libere" aggiunte dal pannello, partendo da
           modello-pagina.html (una copia per pagina, es. tariffe.html);
         - cancella le pagine libere tolte o nascoste dal pannello (solo
           quelle che portano il segno PAGINA-LIBERA dello stampo: le
           altre pagine non le tocca mai);
         - riscrive la sitemap con le sole pagine online, aggiornando la
           data di quelle cambiate.
       Le pagine restano HTML normale, apribile con doppio clic.

   Come si lancia
       node genera.mjs

   Quando
       ogni volta che cambia contenuti.json. Se te ne dimentichi ci
       pensa GitHub: c'e' un'azione che lo rilancia a ogni push
       (.github/workflows/genera.yml).

   Dove sta la regola vera
       in genera-nucleo.js. Li' c'e' la trasformazione (quali segnaposto
       esistono, come si disegnano i blocchi), ed e' lo stesso file che
       usa admin.html per l'anteprima: cosi' quello che la dottoressa
       vede mentre scrive e quello che finisce online non possono
       divergere. Qui restano solo i file da aprire e da salvare.
   ===================================================================== */

import { readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync } from 'node:fs'
import './genera-nucleo.js'

const { generaPagina, controlla, completa, fileDellaPagina, paginaOnline } = globalThis.NucleoGenera

const c = completa(JSON.parse(readFileSync('contenuti.json', 'utf8')))
const PAGINE = ['index.html', 'prestazioni.html', 'domande.html', 'privacy.html', '404.html']
const STAMPO = 'modello-pagina.html'
const SEGNO = 'PAGINA-LIBERA'

const problemi = controlla(c)
if (problemi.length) {
  throw new Error('contenuti.json non va bene:\n  - ' + problemi.join('\n  - '))
}

/* Scrive un file solo se cambia: cosi' GitHub vede modifiche solo dove
   ce ne sono davvero, e la data nella sitemap resta onesta. */
function scrivi(file, dopo) {
  const prima = existsSync(file) ? readFileSync(file, 'utf8') : null
  if (dopo === prima) {
    console.log(`${file}: gia' allineato`)
    return false
  }
  writeFileSync(file, dopo)
  console.log(`${file}: ${prima === null ? 'creato' : 'aggiornato'}`)
  return true
}

/* 1. Le pagine fisse: lo stampo e' il file stesso, riscritto sul posto. */
const cambiate = PAGINE.filter(file => scrivi(file, generaPagina(readFileSync(file, 'utf8'), c)))

/* 2. Le pagine libere visibili, tutte dallo stesso stampo. */
const stampo = readFileSync(STAMPO, 'utf8')
const libere = c.pagine.filter(p => p.tipo === 'libera' && p.visibile !== false)
for (const p of libere) {
  if (scrivi(fileDellaPagina(p), generaPagina(stampo, c, p.id))) cambiate.push(fileDellaPagina(p))
}

/* 3. Le pagine libere che non servono piu' (tolte, nascoste, o col file
   rinominato): si riconoscono dal segno dello stampo. */
const daTenere = libere.map(fileDellaPagina)
for (const file of readdirSync('.').filter(f => f.endsWith('.html') && f !== STAMPO)) {
  if (PAGINE.includes(file) || daTenere.includes(file)) continue
  if (readFileSync(file, 'utf8').includes(SEGNO)) {
    unlinkSync(file)
    console.log(`${file}: tolta (la pagina non e' piu' nel sito)`)
  }
}

/* 4. La sitemap: dice a Google quali pagine ci sono e quando sono
   cambiate. La si riscrive intera, cosi' una pagina nascosta ne esce e
   una nuova ci entra da sola. Per le pagine non cambiate si tiene la
   data che c'era: una data che cambia senza motivo Google la impara a
   ignorare. */
function scriviSitemap() {
  const oggi = new Date().toISOString().slice(0, 10)
  const base = c.studio.sito.replace(/\/$/, '')
  const vecchia = existsSync('sitemap.xml') ? readFileSync('sitemap.xml', 'utf8') : ''
  const date = {}
  for (const [, loc, data] of vecchia.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) date[loc] = data

  const voci = [
    { file: 'index.html', freq: 'monthly', priorita: '1.0' },
    { file: 'prestazioni.html', freq: 'monthly', priorita: '0.9' },
    { file: 'domande.html', freq: 'monthly', priorita: '0.7' },
    ...libere.map(p => ({ file: fileDellaPagina(p), freq: 'monthly', priorita: '0.6' })),
    { file: 'privacy.html', freq: 'yearly', priorita: '0.2' }
  ].filter(v => paginaOnline(c, v.file))

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- La scrive genera.mjs: elenca le pagine online. Non modificarla a mano. -->',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...voci.map(v => {
      const loc = v.file === 'index.html' ? base + '/' : `${base}/${v.file}`
      const data = cambiate.includes(v.file) || !date[loc] ? oggi : date[loc]
      return [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${data}</lastmod>`,
        `    <changefreq>${v.freq}</changefreq>`,
        `    <priority>${v.priorita}</priority>`,
        '  </url>'
      ].join('\n')
    }),
    '</urlset>',
    ''
  ].join('\n')
  scrivi('sitemap.xml', xml)
}
scriviSitemap()

/* Un JSON-LD rotto Google lo scarta in silenzio: meglio accorgersene qui. */
for (const file of PAGINE.concat(daTenere)) {
  const html = readFileSync(file, 'utf8')
  for (const pezzo of html.split('<script type="application/ld+json">').slice(1)) {
    JSON.parse(pezzo.split('</script>')[0])
  }
}
console.log(`Fatto: ${c.prestazioni.length} prestazioni, ${c.domande.length} domande, ${libere.length} pagine libere, dati strutturati validi.`)
