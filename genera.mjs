/* =====================================================================
   GENERATORE DELLE PAGINE — riscrive l'HTML leggendo contenuti.json
   =====================================================================

   Cosa fa
       prende tutti i testi da contenuti.json e li riscrive dentro
       index.html, prestazioni.html, domande.html e privacy.html, poi
       aggiorna la data nella sitemap. Le pagine restano HTML normale,
       apribile con doppio clic: qui non si generano file nuovi, si
       aggiornano quelli che ci sono.

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

import { readFileSync, writeFileSync } from 'node:fs'
import './genera-nucleo.js'

const { generaPagina, controlla } = globalThis.NucleoGenera

const c = JSON.parse(readFileSync('contenuti.json', 'utf8'))
const PAGINE = ['index.html', 'prestazioni.html', 'domande.html', 'privacy.html']

const problemi = controlla(c)
if (problemi.length) {
  throw new Error('contenuti.json non va bene:\n  - ' + problemi.join('\n  - '))
}

function aggiorna(file) {
  const prima = readFileSync(file, 'utf8')
  const dopo = generaPagina(prima, c)
  if (dopo === prima) {
    console.log(`${file}: gia' allineato`)
    return false
  }
  writeFileSync(file, dopo)
  console.log(`${file}: aggiornato`)
  return true
}

/* La data nella sitemap dice a Google "questa pagina e' cambiata il
   tale giorno". Aggiornarla a mano si dimentica, e una data vecchia fa
   passare la pagina piu' di rado: la scriviamo qui, e solo per le
   pagine che sono cambiate davvero. */
function aggiornaSitemap(cambiate) {
  if (!cambiate.length) return
  const oggi = new Date().toISOString().slice(0, 10)
  const base = c.studio.sito.replace(/\/$/, '')
  const indirizzi = cambiate.map(f => (f === 'index.html' ? base + '/' : `${base}/${f}`))

  let xml = readFileSync('sitemap.xml', 'utf8')
  for (const indirizzo of indirizzi) {
    const blocco = new RegExp(`(<loc>${indirizzo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>\\s*<lastmod>)[^<]*`)
    if (blocco.test(xml)) xml = xml.replace(blocco, `$1${oggi}`)
    else console.log(`sitemap.xml: ${indirizzo} non e' elencato`)
  }
  writeFileSync('sitemap.xml', xml)
  console.log(`sitemap.xml: aggiornata la data di ${cambiate.length} pagina/e`)
}

const cambiate = PAGINE.filter(aggiorna)
aggiornaSitemap(cambiate)

/* Un JSON-LD rotto Google lo scarta in silenzio: meglio accorgersene qui. */
for (const file of PAGINE) {
  const html = readFileSync(file, 'utf8')
  for (const pezzo of html.split('<script type="application/ld+json">').slice(1)) {
    JSON.parse(pezzo.split('</script>')[0])
  }
}
console.log(`Fatto: ${c.prestazioni.length} prestazioni, ${c.domande.length} domande, dati strutturati validi.`)
