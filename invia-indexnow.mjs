/* =====================================================================
   SEGNALA LE PAGINE AI MOTORI DI RICERCA (IndexNow)
   =====================================================================

   IndexNow e' il protocollo con cui si dice "questa pagina e' nuova o
   e' cambiata, vienila a vedere" senza aspettare che il motore ci
   arrivi da solo. Lo usano Bing, Yandex, Ecosia, DuckDuckGo, Seznam:
   una segnalazione sola vale per tutti.

   GOOGLE NON ADERISCE. Per Google serve Search Console, che richiede
   di accedere con un account: vedi il README, sezione "Farsi trovare".

   Come si lancia
       node invia-indexnow.mjs

   Quando
       dopo aver pubblicato pagine nuove o cambiato molto quelle che ci
       sono. Non serve a ogni ritocco: segnalare di continuo le stesse
       pagine non accelera niente.

   La chiave sta in un file .txt nella radice del sito: e' cosi' che il
   motore verifica che chi segnala controlli davvero il dominio. Non
   cancellare quel file.
   ===================================================================== */

import { readFileSync } from 'node:fs'

const host = 'dermozanetta.it'
const key = readFileSync('.indexnow-key', 'utf8').trim()

const urlList = [
  `https://${host}/`,
  `https://${host}/prestazioni.html`,
  `https://${host}/domande.html`,
  `https://${host}/privacy.html`,
]

const risposta = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList }),
})

// 200 = accettata, 202 = accettata ma la chiave e' ancora da verificare.
console.log(`IndexNow: ${risposta.status} ${risposta.statusText}`)
console.log(urlList.length + ' pagine segnalate')
if (risposta.status >= 400) console.log(await risposta.text())
