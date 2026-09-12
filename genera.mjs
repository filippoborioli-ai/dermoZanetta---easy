/* =====================================================================
   GENERATORE DELLE SCHEDE — da lanciare dopo aver modificato dati.js
   =====================================================================

   Cosa fa
       legge l'elenco in dati.js e scrive le schede dentro index.html e
       prestazioni.html, fra i due commenti PRESTAZIONI:INIZIO e
       PRESTAZIONI:FINE. Quello che sta fra i due marcatori viene
       riscritto ogni volta: non modificarlo a mano, si perde.

   Perche' esiste
       prima le schede le disegnava JavaScript nel browser. Funzionava
       per chi guarda il sito, ma Google leggeva una pagina quasi vuota:
       le parole "acne", "psoriasi", "mappatura dei nei" non erano
       nell'HTML, quindi non finivano nell'indice. Ora ci sono.

   Come si lancia
       node genera.mjs

   Quando
       ogni volta che si tocca dati.js. Se te ne dimentichi ci pensa
       GitHub: c'e' un'azione automatica che lo rilancia a ogni push
       (.github/workflows/genera.yml).
   ===================================================================== */

import { readFileSync, writeFileSync } from 'node:fs'

const INIZIO = '<!-- PRESTAZIONI:INIZIO — generato da genera.mjs, non modificare a mano -->'
const FINE = '<!-- PRESTAZIONI:FINE -->'

/* dati.js non e' un modulo: dichiara una const e basta. Lo valutiamo e
   ci facciamo restituire l'array, invece di leggerlo con espressioni
   regolari che si romperebbero al primo apostrofo strano. */
function leggiPrestazioni() {
  const sorgente = readFileSync('dati.js', 'utf8')
  return new Function(`${sorgente}; return PRESTAZIONI;`)()
}

/* Quello che finisce nell'HTML e' testo, non codice: se in dati.js
   qualcuno scrive "<" o "&", deve restare un carattere visibile. */
function esc(t) {
  return String(t)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/* Stessa normalizzazione della ricerca in script.js: via accenti e
   maiuscole, cosi' "psoriasi" trova anche "Psoriàsi". Le chiavi entrano
   qui dentro e non a schermo: servono solo a far trovare la scheda. */
function normalizza(t) {
  return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function schede(elenco, indent) {
  return elenco.map(p => {
    const cerca = normalizza(`${p.nome} ${p.testo} ${p.chiavi || ''}`).replace(/\s+/g, ' ').trim()
    return [
      `${indent}<article class="card" data-cerca="${esc(cerca)}">`,
      `${indent}  <h3>${esc(p.nome)}</h3>`,
      `${indent}  <p>${esc(p.testo)}</p>`,
      `${indent}</article>`,
    ].join('\n')
  }).join('\n')
}

function aggiorna(file, elenco, indent) {
  const html = readFileSync(file, 'utf8')
  const a = html.indexOf(INIZIO)
  const b = html.indexOf(FINE)
  if (a === -1 || b === -1) {
    throw new Error(`${file}: marcatori PRESTAZIONI:INIZIO / PRESTAZIONI:FINE non trovati`)
  }
  const nuovo =
    html.slice(0, a + INIZIO.length) +
    '\n' + schede(elenco, indent) + '\n' + indent +
    html.slice(b)
  if (nuovo === html) {
    console.log(`${file}: gia' aggiornato`)
    return false
  }
  writeFileSync(file, nuovo)
  console.log(`${file}: scritte ${elenco.length} schede`)
  return true
}

/* Le stesse prestazioni entrano anche nei dati strutturati della home:
   e' il modo in cui si dice a Google "questo studio fa queste cose",
   in una forma che legge senza doverla dedurre dal testo. La sorgente
   resta dati.js, cosi' non esistono due elenchi da tenere allineati.
   Il segnaposto e' la proprieta' availableService: viene sostituita
   tutta, e fra una generazione e l'altra il JSON resta valido. */
function aggiornaDatiStrutturati(file, elenco) {
  const html = readFileSync(file, 'utf8')
  const servizi = elenco.map(p => ({
    '@type': 'MedicalProcedure',
    name: p.nome,
    description: p.testo,
  }))
  const blocco = '"availableService":' + JSON.stringify(servizi, null, 2)
    .split('\n').map((r, i) => (i === 0 ? r : '  ' + r)).join('\n')

  const nuovo = html.replace(/"availableService":\s*\[[\s\S]*?\n  \]/, blocco)
  if (nuovo === html) {
    throw new Error(`${file}: proprieta' availableService non trovata nel JSON-LD`)
  }
  writeFileSync(file, nuovo)

  // Un JSON-LD rotto Google lo scarta in silenzio: meglio accorgersene qui.
  const json = nuovo.split('<script type="application/ld+json">')[1].split('</script>')[0]
  const dati = JSON.parse(json)
  console.log(`${file}: ${dati.availableService.length} prestazioni nei dati strutturati`)
}

const prestazioni = leggiPrestazioni()
if (!Array.isArray(prestazioni) || !prestazioni.length) {
  throw new Error('dati.js non contiene nessuna prestazione')
}
for (const p of prestazioni) {
  if (!p.nome || !p.testo) throw new Error(`prestazione senza nome o testo: ${JSON.stringify(p)}`)
}

aggiorna('index.html', prestazioni, '        ')
aggiorna('prestazioni.html', prestazioni, '        ')
aggiornaDatiStrutturati('index.html', prestazioni)
