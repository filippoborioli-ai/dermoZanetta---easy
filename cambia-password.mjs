/* =====================================================================
   CAMBIA LA PASSWORD DEL PANNELLO
   =====================================================================

   Come si usa
       node cambia-password.mjs "la-nuova-password"
       node cambia-password.mjs "la-nuova-password" nuova@email.it

   Cosa fa
       calcola l'impronta della password nuova e la riscrive dentro
       admin.js. La password in chiaro non viene salvata da nessuna
       parte: dall'impronta non si torna indietro.

   Dopo
       - fai il push (o carica admin.js su GitHub);
       - scrivi la password nuova in CREDENZIALI.md, che resta sul tuo
         computer e non finisce nel deposito.

   Da sapere
       la password apre il pannello. Non basta per pubblicare: per
       quello serve il codice di pubblicazione, che sta cifrato nel
       browser di chi gestisce il sito. Cambiare la password non
       invalida il codice gia' salvato su un dispositivo: se serve
       togliere l'accesso a qualcuno, il codice va revocato su GitHub
       (Settings -> Developer settings -> Personal access tokens).
   ===================================================================== */

import { readFileSync, writeFileSync } from 'node:fs'
import { randomBytes, pbkdf2Sync } from 'node:crypto'

const GIRI = 250000

const password = process.argv[2]
const email = process.argv[3]

if (!password) {
  console.error('Uso: node cambia-password.mjs "la-nuova-password" [nuova@email.it]')
  process.exit(1)
}
if (password.length < 12) {
  console.error('Password troppo corta: almeno 12 caratteri. La pagina e\' pubblica, la password si puo\' provare a indovinare.')
  process.exit(1)
}

const sale = randomBytes(16).toString('hex')
const impronta = pbkdf2Sync(password, Buffer.from(sale, 'hex'), GIRI, 32, 'sha256').toString('hex')

let js = readFileSync('admin.js', 'utf8')
const prima = js

js = js.replace(/(sale:\s*')[0-9a-f]+(')/, `$1${sale}$2`)
js = js.replace(/(impronta:\s*')[0-9a-f]+(')/, `$1${impronta}$2`)
if (email) js = js.replace(/(email:\s*')[^']*(')/, `$1${email}$2`)

if (js === prima) {
  console.error('admin.js: non ho trovato le righe da riscrivere. E\' stato modificato?')
  process.exit(1)
}

writeFileSync('admin.js', js)
console.log('admin.js aggiornato.')
console.log(`  email:    ${email || '(invariata)'}`)
console.log('  password: quella che hai scritto — segnala in CREDENZIALI.md, non e\' recuperabile da qui.')
