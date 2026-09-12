/* =====================================================================
   PANNELLO DI MODIFICA DEL SITO
   =====================================================================

   A cosa serve
       far cambiare alla dottoressa tutti i testi, gli orari, le foto,
       le prestazioni e le domande del sito senza aprire un file di
       codice. Si modifica un modulo, si preme "Salva e pubblica".

   Come funziona, in tre righe
       1. tutti i testi del sito stanno in contenuti.json;
       2. questa pagina legge quel file, lo mostra come modulo e lo
          riscrive;
       3. il file riscritto viene mandato a GitHub. Li' un'azione
          automatica rilancia genera.mjs, che riscrive le pagine HTML.
          Il sito si aggiorna da solo in un paio di minuti.

   La serratura
       la password apre questa pagina. Ma la pagina, da sola, non puo'
       pubblicare niente: per farlo serve un "codice di pubblicazione"
       (un token GitHub) che sta cifrato nel browser della dottoressa e
       si apre con la stessa password. Chi apre admin.html senza quel
       codice vede il modulo e puo' scaricare il file, non puo' toccare
       il sito. E' scritto apposta cosi': un sito statico non ha un
       server dove nascondere una password, quindi la vera barriera e'
       il codice, non la password.

   Aggiungere un campo modificabile
       1. aggiungi la voce in contenuti.json;
       2. aggiungila all'elenco SEZIONI qui sotto;
       3. metti il segnaposto nell'HTML e, se serve, il blocco in
          genera.mjs.
   ===================================================================== */

(function () {
  'use strict'

  /* -------------------------------------------------------------------
     Configurazione
     ---------------------------------------------------------------- */
  var DEPOSITO = {
    proprietario: 'filippoborioli-ai',
    nome: 'dermoZanetta---easy',
    ramo: 'main'
  }

  /* Email e password di accesso. La password non e' scritta qui: c'e'
     solo la sua impronta, che non si puo' riportare indietro. Per
     cambiarla vedi CREDENZIALI.md. */
  var ACCESSO = {
    email: 'dermozanetta@gmail.com',
    sale: 'f5882af4b748c01272eb4fcafb8565c0',
    impronta: '4fb25f9b00c91ffe62b6793a0687a94d9db593b6bcaa8b80153fd2f2f34c8aae',
    giri: 250000
  }

  var CHIAVE_CODICE = 'dermozanetta.codice'   // token cifrato
  var CHIAVE_BOZZA = 'dermozanetta.bozza'     // modifiche non pubblicate

  /* -------------------------------------------------------------------
     Stato
     ---------------------------------------------------------------- */
  var dati = null           // contenuti.json in memoria
  var versione = null       // identificativo della versione su GitHub (sha)
  var chiaveCifratura = null
  var codice = null         // token GitHub in chiaro, solo in memoria
  var codaImmagini = []     // immagini scelte e non ancora pubblicate
  var modificato = false
  var sezioneAperta = null

  /* -------------------------------------------------------------------
     Scorciatoie
     ---------------------------------------------------------------- */
  function $(id) { return document.getElementById(id) }

  function creaElemento(tag, classe, testo) {
    var el = document.createElement(tag)
    if (classe) el.className = classe
    if (testo != null) el.textContent = testo
    return el
  }

  /* "home.titolo" -> dati.home.titolo */
  function leggi(percorso) {
    return percorso.split('.').reduce(function (o, k) { return o == null ? o : o[k] }, dati)
  }

  function scrivi(percorso, valore) {
    var parti = percorso.split('.')
    var ultima = parti.pop()
    var obj = parti.reduce(function (o, k) { return o[k] }, dati)
    obj[ultima] = valore
    segnaModificato()
  }

  function segnaModificato() {
    modificato = true
    mostraStato('Modifiche non pubblicate', '')
    try { localStorage.setItem(CHIAVE_BOZZA, JSON.stringify(dati)) } catch (e) { /* spazio finito: pazienza */ }
  }

  function mostraStato(testo, tipo) {
    var el = $('stato')
    el.textContent = testo
    el.className = 'stato' + (tipo ? ' ' + tipo : '')
  }

  /* -------------------------------------------------------------------
     Cifratura — serve solo a tenere il codice di pubblicazione al
     riparo nel browser: senza la password non si apre.
     ---------------------------------------------------------------- */
  function daEsadecimale(hex) {
    var byte = new Uint8Array(hex.length / 2)
    for (var i = 0; i < byte.length; i++) byte[i] = parseInt(hex.substr(i * 2, 2), 16)
    return byte
  }

  function aEsadecimale(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), function (b) {
      return ('0' + b.toString(16)).slice(-2)
    }).join('')
  }

  function materialePassword(password) {
    return crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits', 'deriveKey'])
  }

  async function improntaPassword(password) {
    var base = await materialePassword(password)
    var bit = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: daEsadecimale(ACCESSO.sale), iterations: ACCESSO.giri, hash: 'SHA-256' },
      base, 256
    )
    return aEsadecimale(bit)
  }

  async function derivaChiave(password) {
    var base = await materialePassword(password)
    // Sale diverso da quello dell'impronta: la chiave che apre il codice
    // non deve poter essere ricavata dall'impronta scritta in chiaro qui.
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: new TextEncoder().encode('cifratura.' + ACCESSO.sale), iterations: ACCESSO.giri, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
    )
  }

  async function cifra(testo) {
    var iv = crypto.getRandomValues(new Uint8Array(12))
    var segreto = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, chiaveCifratura, new TextEncoder().encode(testo))
    return aEsadecimale(iv) + '.' + aEsadecimale(segreto)
  }

  async function decifra(pacchetto) {
    var pezzi = String(pacchetto).split('.')
    var chiaro = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: daEsadecimale(pezzi[0]) }, chiaveCifratura, daEsadecimale(pezzi[1])
    )
    return new TextDecoder().decode(chiaro)
  }

  /* -------------------------------------------------------------------
     GitHub — leggere e scrivere i file del sito
     ---------------------------------------------------------------- */
  function indirizzoFile(percorso) {
    return 'https://api.github.com/repos/' + DEPOSITO.proprietario + '/' + DEPOSITO.nome + '/contents/' + percorso
  }

  function intestazioni() {
    return {
      'Authorization': 'Bearer ' + codice,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  }

  function inBase64(testo) {
    var byte = new TextEncoder().encode(testo)
    var pezzi = ''
    // A blocchi: con un file grande, passare tutto in una volta a
    // String.fromCharCode fa saltare il browser.
    for (var i = 0; i < byte.length; i += 8192) {
      pezzi += String.fromCharCode.apply(null, byte.subarray(i, i + 8192))
    }
    return btoa(pezzi)
  }

  function daBase64(b64) {
    var binario = atob(String(b64).replace(/\s/g, ''))
    var byte = new Uint8Array(binario.length)
    for (var i = 0; i < binario.length; i++) byte[i] = binario.charCodeAt(i)
    return new TextDecoder().decode(byte)
  }

  async function leggiDaGitHub(percorso) {
    var risposta = await fetch(indirizzoFile(percorso) + '?ref=' + DEPOSITO.ramo + '&t=' + Date.now(), { headers: intestazioni() })
    if (risposta.status === 404) return null
    if (!risposta.ok) throw new Error(await messaggioErrore(risposta))
    var corpo = await risposta.json()
    return { testo: daBase64(corpo.content), versione: corpo.sha }
  }

  async function scriviSuGitHub(percorso, contenutoBase64, versionePrecedente, messaggio) {
    var corpo = {
      message: messaggio,
      content: contenutoBase64,
      branch: DEPOSITO.ramo
    }
    if (versionePrecedente) corpo.sha = versionePrecedente
    var risposta = await fetch(indirizzoFile(percorso), {
      method: 'PUT',
      headers: Object.assign({ 'Content-Type': 'application/json' }, intestazioni()),
      body: JSON.stringify(corpo)
    })
    if (!risposta.ok) throw new Error(await messaggioErrore(risposta))
    return (await risposta.json()).content.sha
  }

  async function messaggioErrore(risposta) {
    var dettaglio = ''
    try { dettaglio = (await risposta.json()).message || '' } catch (e) { /* risposta senza corpo */ }
    if (risposta.status === 401) return 'Il codice di pubblicazione non è valido o è scaduto. Rifallo dalla sezione "Pubblicazione".'
    if (risposta.status === 403) return 'Il codice di pubblicazione non ha il permesso di scrivere su questo sito.'
    if (risposta.status === 409) return 'Qualcun altro ha modificato il sito nel frattempo. Ricarica la pagina e riprova.'
    return 'GitHub ha risposto ' + risposta.status + (dettaglio ? ': ' + dettaglio : '')
  }

  /* -------------------------------------------------------------------
     Immagini — ridotte e compresse qui, prima di partire: e' quello che
     tiene il sito veloce anche con le foto fatte col telefono.
     ---------------------------------------------------------------- */
  function leggiFile(file) {
    return new Promise(function (ok, no) {
      var lettore = new FileReader()
      lettore.onload = function () { ok(lettore.result) }
      lettore.onerror = function () { no(new Error('Non riesco a leggere il file scelto.')) }
      lettore.readAsDataURL(file)
    })
  }

  function caricaImmagine(dataUrl) {
    return new Promise(function (ok, no) {
      var img = new Image()
      img.onload = function () { ok(img) }
      img.onerror = function () { no(new Error('Il file scelto non sembra un’immagine.')) }
      img.src = dataUrl
    })
  }

  async function preparaImmagine(file, opzioni) {
    var img = await caricaImmagine(await leggiFile(file))
    var lato = Math.max(img.width, img.height)
    var scala = Math.min(1, opzioni.maxLato / lato)
    var tela = document.createElement('canvas')
    tela.width = Math.round(img.width * scala)
    tela.height = Math.round(img.height * scala)
    var pennello = tela.getContext('2d')
    // I PNG dei loghi hanno lo sfondo trasparente: va tenuto.
    if (opzioni.formato === 'image/jpeg') {
      pennello.fillStyle = '#ffffff'
      pennello.fillRect(0, 0, tela.width, tela.height)
    }
    pennello.drawImage(img, 0, 0, tela.width, tela.height)

    var dataUrl = tela.toDataURL(opzioni.formato, opzioni.qualita)
    var estensione = opzioni.formato === 'image/png' ? 'png' : 'jpg'
    // Nome nuovo a ogni caricamento: cosi' chi ha gia' visitato il sito
    // vede subito la foto nuova invece di quella vecchia in memoria.
    var percorso = opzioni.cartella + opzioni.nome + '-' + Date.now() + '.' + estensione
    return {
      percorso: percorso,
      base64: dataUrl.split(',')[1],
      anteprima: dataUrl,
      peso: Math.round(dataUrl.length * 0.75 / 1024)
    }
  }

  /* -------------------------------------------------------------------
     I campi del modulo
     ---------------------------------------------------------------- */
  function campoTesto(percorso, opzioni) {
    opzioni = opzioni || {}
    var box = creaElemento('div', 'campo')
    var id = 'c_' + percorso.replace(/\./g, '_')

    var etichetta = creaElemento('label', null, opzioni.etichetta || percorso)
    etichetta.htmlFor = id
    box.appendChild(etichetta)

    if (opzioni.aiuto) box.appendChild(creaElemento('p', 'aiuto', opzioni.aiuto))

    var campo = document.createElement(opzioni.tipo === 'area' ? 'textarea' : 'input')
    if (opzioni.tipo !== 'area') campo.type = opzioni.tipo || 'text'
    campo.id = id
    campo.value = leggi(percorso) == null ? '' : leggi(percorso)
    if (opzioni.righe) campo.rows = opzioni.righe
    box.appendChild(campo)

    var conteggio = null
    if (opzioni.consigliato) {
      conteggio = creaElemento('p', 'conteggio')
      box.appendChild(conteggio)
    }

    function aggiornaConteggio() {
      if (!conteggio) return
      var n = campo.value.length
      conteggio.textContent = n + ' caratteri (consigliati fino a ' + opzioni.consigliato + ')'
      conteggio.classList.toggle('lungo', n > opzioni.consigliato)
    }

    campo.addEventListener('input', function () {
      var valore = opzioni.tipo === 'number' ? Number(campo.value) : campo.value
      // "dopo" aggiorna i valori che si ricavano da questo (per esempio il
      // link del telefono dal numero scritto): va eseguito prima di
      // salvare, altrimenti la bozza salva la versione vecchia.
      if (opzioni.dopo) opzioni.dopo(valore)
      scrivi(percorso, valore)
      aggiornaConteggio()
    })
    aggiornaConteggio()
    return box
  }

  /* Elenco di testi semplici: i paragrafi del "Chi ti visita", i punti
     dell'elenco puntato. */
  function elencoTesti(percorso, opzioni) {
    var box = creaElemento('div')
    var lista = creaElemento('div')
    box.appendChild(lista)

    function disegna() {
      lista.textContent = ''
      var voci = leggi(percorso)
      voci.forEach(function (testo, i) {
        var voce = creaElemento('div', 'voce')
        var testa = creaElemento('div', 'voce-testa')
        testa.appendChild(creaElemento('span', 'numero', opzioni.nomeVoce + ' ' + (i + 1)))
        testa.appendChild(bottoneSposta(percorso, i, -1, disegna))
        testa.appendChild(bottoneSposta(percorso, i, +1, disegna))
        testa.appendChild(bottoneTogli(percorso, i, disegna, opzioni.nomeVoce))
        voce.appendChild(testa)

        var campo = document.createElement(opzioni.tipo === 'area' ? 'textarea' : 'input')
        if (opzioni.tipo !== 'area') campo.type = 'text'
        campo.value = testo
        campo.setAttribute('aria-label', opzioni.nomeVoce + ' ' + (i + 1))
        campo.addEventListener('input', function () {
          leggi(percorso)[i] = campo.value
          segnaModificato()
        })
        voce.appendChild(campo)
        lista.appendChild(voce)
      })
    }

    var aggiungi = creaElemento('button', 'btn btn-ghost', '+ Aggiungi ' + opzioni.nomeVoce.toLowerCase())
    aggiungi.type = 'button'
    aggiungi.addEventListener('click', function () {
      leggi(percorso).push('')
      segnaModificato()
      disegna()
    })
    box.appendChild(aggiungi)

    disegna()
    return box
  }

  /* Elenco di schede con piu' campi: prestazioni, domande frequenti. */
  function elencoSchede(percorso, campi, opzioni) {
    var box = creaElemento('div')
    var lista = creaElemento('div')
    box.appendChild(lista)

    function disegna() {
      lista.textContent = ''
      var voci = leggi(percorso)
      voci.forEach(function (voceDati, i) {
        var voce = creaElemento('div', 'voce')
        var testa = creaElemento('div', 'voce-testa')
        testa.appendChild(creaElemento('span', 'numero', (i + 1) + ' di ' + voci.length))
        testa.appendChild(bottoneSposta(percorso, i, -1, disegna))
        testa.appendChild(bottoneSposta(percorso, i, +1, disegna))
        testa.appendChild(bottoneTogli(percorso, i, disegna, opzioni.nomeVoce, voceDati[campi[0].k]))
        voce.appendChild(testa)

        campi.forEach(function (c) {
          voce.appendChild(campoTesto(percorso + '.' + i + '.' + c.k, {
            etichetta: c.etichetta, aiuto: c.aiuto, tipo: c.tipo, righe: c.righe
          }))
        })
        lista.appendChild(voce)
      })
      if (!voci.length) lista.appendChild(creaElemento('p', 'avviso avviso-info', 'Nessuna voce. Usa il bottone qui sotto per aggiungerne una.'))
    }

    var aggiungi = creaElemento('button', 'btn btn-ghost', '+ Aggiungi ' + opzioni.nomeVoce.toLowerCase())
    aggiungi.type = 'button'
    aggiungi.addEventListener('click', function () {
      var nuova = {}
      campi.forEach(function (c) { nuova[c.k] = '' })
      leggi(percorso).push(nuova)
      segnaModificato()
      disegna()
      lista.lastChild.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
    box.appendChild(aggiungi)

    disegna()
    return box
  }

  function bottoneSposta(percorso, i, direzione, ridisegna) {
    var b = creaElemento('button', 'btn btn-ghost btn-sm', direzione < 0 ? '↑' : '↓')
    b.type = 'button'
    b.title = direzione < 0 ? 'Sposta più in alto' : 'Sposta più in basso'
    var voci = leggi(percorso)
    b.disabled = direzione < 0 ? i === 0 : i === voci.length - 1
    b.addEventListener('click', function () {
      var lista = leggi(percorso)
      var scambio = lista[i + direzione]
      lista[i + direzione] = lista[i]
      lista[i] = scambio
      segnaModificato()
      ridisegna()
    })
    return b
  }

  function bottoneTogli(percorso, i, ridisegna, nomeVoce, nome) {
    var b = creaElemento('button', 'btn btn-rosso btn-sm', 'Togli')
    b.type = 'button'
    b.addEventListener('click', function () {
      var cosa = nome ? '“' + nome + '”' : nomeVoce.toLowerCase() + ' n. ' + (i + 1)
      if (!confirm('Vuoi togliere ' + cosa + ' dal sito?\n\nSparisce solo dopo che premi "Salva e pubblica".')) return
      leggi(percorso).splice(i, 1)
      segnaModificato()
      ridisegna()
    })
    return b
  }

  /* Orari: sette righe fisse, una per giorno. Si scrive "chiuso" oppure
     un orario. Il giorno chiuso non viene mandato a Google. */
  function tabellaOrari() {
    var tabella = creaElemento('table', 'orari')
    var corpo = creaElemento('tbody')
    dati.orari.forEach(function (riga, i) {
      var tr = creaElemento('tr')
      tr.appendChild(creaElemento('th', null, riga.giorno))
      var td = creaElemento('td')
      var campo = document.createElement('input')
      campo.type = 'text'
      campo.value = riga.orario
      campo.setAttribute('aria-label', 'Orario di ' + riga.giorno)
      campo.addEventListener('input', function () {
        dati.orari[i].orario = campo.value
        segnaModificato()
      })
      td.appendChild(campo)
      tr.appendChild(td)
      corpo.appendChild(tr)
    })
    tabella.appendChild(corpo)
    return tabella
  }

  /* Foto del sito: quattro posti fissi. */
  function elencoFoto() {
    var box = creaElemento('div')
    var posti = [
      { k: 'dottoressa', nome: 'Ritratto in apertura', nota: 'Foto verticale, centrata sul viso: il riquadro è alto e stretto.' },
      { k: 'ingresso', nome: 'Studio — ingresso', nota: '' },
      { k: 'studio', nome: 'Studio — sala visite', nota: '' },
      { k: 'salaAttesa', nome: 'Studio — sala d’attesa', nota: '' }
    ]
    posti.forEach(function (posto) {
      box.appendChild(rigaImmagine({
        titolo: posto.nome,
        nota: posto.nota,
        percorsoFile: 'foto.' + posto.k + '.file',
        percorsoAlt: 'foto.' + posto.k + '.alt',
        nomeFile: posto.k,
        cartella: 'img/',
        formato: 'image/jpeg',
        maxLato: 1600,
        qualita: 0.82
      }))
    })
    return box
  }

  /* Loghi delle collaborazioni: quanti se ne vuole. */
  function elencoLoghi() {
    var box = creaElemento('div')
    var lista = creaElemento('div')
    box.appendChild(lista)

    function disegna() {
      lista.textContent = ''
      dati.loghi.forEach(function (logo, i) {
        var riga = rigaImmagine({
          titolo: 'Logo ' + (i + 1),
          nota: '',
          percorsoFile: 'loghi.' + i + '.file',
          percorsoAlt: 'loghi.' + i + '.alt',
          nomeFile: 'logo',
          cartella: 'img/loghi/',
          formato: 'image/png',
          maxLato: 500,
          qualita: 1,
          classe: 'logo',
          togli: function () {
            if (!confirm('Vuoi togliere questo logo dal sito?')) return
            dati.loghi.splice(i, 1)
            segnaModificato()
            disegna()
          }
        })
        lista.appendChild(riga)
      })
    }

    var aggiungi = creaElemento('button', 'btn btn-ghost', '+ Aggiungi un logo')
    aggiungi.type = 'button'
    aggiungi.addEventListener('click', function () {
      dati.loghi.push({ file: '', alt: '' })
      segnaModificato()
      disegna()
    })
    box.appendChild(aggiungi)

    disegna()
    return box
  }

  function rigaImmagine(opzioni) {
    var riga = creaElemento('div', 'foto-riga' + (opzioni.classe ? ' ' + opzioni.classe : ''))

    var anteprima = document.createElement('img')
    anteprima.alt = ''
    var fileAttuale = leggi(opzioni.percorsoFile)
    if (fileAttuale) anteprima.src = fileAttuale
    riga.appendChild(anteprima)

    var lato = creaElemento('div')
    lato.appendChild(creaElemento('h3', null, opzioni.titolo))
    if (opzioni.nota) lato.appendChild(creaElemento('p', 'aiuto', opzioni.nota))

    var scelta = document.createElement('input')
    scelta.type = 'file'
    scelta.accept = 'image/*'
    scelta.setAttribute('aria-label', 'Scegli una nuova immagine per ' + opzioni.titolo)
    var esito = creaElemento('p', 'aiuto')

    scelta.addEventListener('change', async function () {
      var file = scelta.files && scelta.files[0]
      if (!file) return
      esito.textContent = 'Preparo l’immagine…'
      esito.className = 'aiuto'
      try {
        var pronta = await preparaImmagine(file, {
          cartella: opzioni.cartella,
          nome: opzioni.nomeFile,
          formato: opzioni.formato,
          maxLato: opzioni.maxLato,
          qualita: opzioni.qualita
        })
        anteprima.src = pronta.anteprima
        codaImmagini.push(pronta)
        scrivi(opzioni.percorsoFile, pronta.percorso)
        esito.textContent = 'Pronta (' + pronta.peso + ' KB). Va online quando premi “Salva e pubblica”.'
        esito.className = 'nuova'
      } catch (errore) {
        esito.textContent = errore.message
        esito.className = 'aiuto'
      }
    })

    lato.appendChild(scelta)
    lato.appendChild(esito)
    lato.appendChild(campoTesto(opzioni.percorsoAlt, {
      etichetta: 'Descrizione della foto',
      aiuto: 'La leggono Google e chi non vede la pagina. Descrivi cosa si vede, in poche parole.'
    }))

    if (opzioni.togli) {
      var b = creaElemento('button', 'btn btn-rosso btn-sm', 'Togli questo logo')
      b.type = 'button'
      b.addEventListener('click', opzioni.togli)
      lato.appendChild(b)
    }

    riga.appendChild(lato)
    return riga
  }

  /* -------------------------------------------------------------------
     Le sezioni del pannello
     ---------------------------------------------------------------- */
  var SEZIONI = [
    {
      id: 'studio',
      nome: 'Studio e contatti',
      titolo: 'Dati dello studio',
      guida: 'Sono i dati che compaiono ovunque: in fondo a ogni pagina, nei bottoni "Chiama", nella privacy e nella scheda che legge Google. Si scrivono una volta sola, qui.',
      disegna: function (box) {
        box.appendChild(campoTesto('studio.nomeMedico', { etichetta: 'Nome del medico', aiuto: 'Come appare in testata e in fondo alle pagine.' }))
        box.appendChild(campoTesto('studio.specialita', { etichetta: 'Specializzazione' }))
        box.appendChild(campoTesto('studio.telefonoVisibile', {
          etichetta: 'Telefono',
          aiuto: 'Scrivilo come vuoi che si legga, per esempio 351 511 8880. Il link per chiamare si costruisce da solo.',
          dopo: function (valore) {
            var cifre = String(valore).replace(/[^\d+]/g, '')
            dati.studio.telefonoLink = cifre.charAt(0) === '+' ? cifre : '+39' + cifre
          }
        }))
        box.appendChild(campoTesto('studio.email', { etichetta: 'Email', tipo: 'email' }))
        box.appendChild(campoTesto('studio.via', { etichetta: 'Indirizzo', aiuto: 'Via e numero civico, per esempio Piazza Castello 27.' }))
        box.appendChild(campoTesto('studio.cap', { etichetta: 'CAP' }))
        box.appendChild(campoTesto('studio.citta', { etichetta: 'Città' }))
        box.appendChild(campoTesto('studio.provincia', { etichetta: 'Provincia', aiuto: 'Due lettere, per esempio VB.' }))
        box.appendChild(campoTesto('studio.mappaUrl', {
          etichetta: 'Link a Google Maps',
          aiuto: 'È il link della scheda Google dello studio: lo aprono i bottoni "Dove si trova".'
        }))
        box.appendChild(campoTesto('studio.partitaIva', { etichetta: 'Partita IVA', aiuto: 'Obbligatoria per legge sul sito di un medico: non va tolta.' }))
        box.appendChild(campoTesto('studio.ordine', {
          etichetta: 'Iscrizione all’Ordine',
          tipo: 'area',
          aiuto: 'Obbligatoria per legge. Compare in fondo a ogni pagina.'
        }))
        box.appendChild(avanzate([
          campoTesto('studio.iniziale', { etichetta: 'Lettera del marchio', aiuto: 'La lettera nel cerchio in alto a sinistra.' }),
          campoTesto('studio.viaDatiStrutturati', { etichetta: 'Indirizzo per Google', aiuto: 'Stesso indirizzo con la virgola prima del numero: Piazza Castello, 27.' }),
          campoTesto('studio.sito', { etichetta: 'Indirizzo del sito', aiuto: 'Con https:// e la barra finale.' }),
          campoTesto('studio.latitudine', { etichetta: 'Latitudine', tipo: 'number' }),
          campoTesto('studio.longitudine', { etichetta: 'Longitudine', tipo: 'number' })
        ]))
      }
    },

    {
      id: 'home',
      nome: 'Prima schermata',
      titolo: 'La prima schermata della home',
      guida: 'È quello che si vede appena si apre il sito: la frase grande, la riga sotto e i bottoni.',
      disegna: function (box) {
        box.appendChild(campoTesto('home.eyebrow', { etichetta: 'Riga piccola in alto' }))
        box.appendChild(campoTesto('home.titolo', { etichetta: 'Frase grande (titolo)', tipo: 'area', righe: 2, aiuto: 'È la frase più importante del sito, anche per Google: meglio se contiene "dermatologo" o "dermatologa" e il nome della città.' }))
        box.appendChild(campoTesto('home.lead', { etichetta: 'Frase di presentazione', tipo: 'area' }))
        box.appendChild(campoTesto('home.bottonePrestazioni', { etichetta: 'Secondo bottone' }))
        box.appendChild(campoTesto('home.bottoneMappa', { etichetta: 'Terzo bottone (mappa)' }))
        box.appendChild(campoTesto('home.nota', { etichetta: 'Riga sotto i bottoni' }))
      }
    },

    {
      id: 'medico',
      nome: 'Il medico',
      titolo: 'Sezione “Chi ti visita”',
      guida: 'La presentazione. I paragrafi sono il testo corrente, i punti sono l’elenco con la spunta.',
      disegna: function (box) {
        box.appendChild(campoTesto('chiSono.eyebrow', { etichetta: 'Riga piccola' }))
        box.appendChild(campoTesto('chiSono.titolo', { etichetta: 'Titolo' }))
        box.appendChild(creaElemento('h3', null, 'Paragrafi'))
        box.appendChild(elencoTesti('chiSono.paragrafi', { nomeVoce: 'Paragrafo', tipo: 'area' }))
        box.appendChild(creaElemento('h3', null, 'Elenco con la spunta'))
        box.appendChild(elencoTesti('chiSono.punti', { nomeVoce: 'Punto', tipo: 'testo' }))
      }
    },

    {
      id: 'prestazioni',
      nome: 'Prestazioni',
      titolo: 'Le prestazioni',
      guida: 'Compaiono in due punti: nel carosello della home e, tutte, nella pagina Prestazioni con la casella di ricerca. Si scrivono una volta sola. L’ordine di questo elenco è l’ordine sulla pagina.',
      disegna: function (box) {
        box.appendChild(creaElemento('p', 'avviso avviso-info',
          'Il tono deve restare informativo, mai pubblicitario: la pubblicità sanitaria in Italia è vietata (legge 145/2018). Si scrive che cos’è e a cosa serve, non "i migliori risultati" o "risolviamo".'))

        box.appendChild(elencoSchede('prestazioni', [
          { k: 'nome', etichetta: 'Nome della prestazione' },
          { k: 'testo', etichetta: 'Descrizione', tipo: 'area' },
          { k: 'chiavi', etichetta: 'Parole per la ricerca', tipo: 'area', righe: 2, aiuto: 'Non si vedono sulla pagina. Sono le parole con cui i pazienti cercano davvero: chi ha l’acne scrive "brufoli". Separale con uno spazio.' }
        ], { nomeVoce: 'Prestazione' }))

        box.appendChild(creaElemento('h3', null, 'Testi della sezione in home'))
        box.appendChild(campoTesto('sezionePrestazioni.eyebrow', { etichetta: 'Riga piccola' }))
        box.appendChild(campoTesto('sezionePrestazioni.titolo', { etichetta: 'Titolo' }))
        box.appendChild(campoTesto('sezionePrestazioni.intro', { etichetta: 'Testo introduttivo', tipo: 'area' }))
        box.appendChild(campoTesto('sezionePrestazioni.bottone', { etichetta: 'Bottone in fondo' }))

        box.appendChild(creaElemento('h3', null, 'Testi della pagina Prestazioni'))
        box.appendChild(campoTesto('paginaPrestazioni.eyebrow', { etichetta: 'Riga piccola' }))
        box.appendChild(campoTesto('paginaPrestazioni.titolo', { etichetta: 'Titolo della pagina' }))
        box.appendChild(campoTesto('paginaPrestazioni.lead', { etichetta: 'Testo di apertura', tipo: 'area' }))
        box.appendChild(campoTesto('paginaPrestazioni.etichettaRicerca', { etichetta: 'Scritta sopra la casella di ricerca' }))
        box.appendChild(campoTesto('paginaPrestazioni.suggerimentoRicerca', { etichetta: 'Esempio dentro la casella' }))
        box.appendChild(campoTesto('paginaPrestazioni.notaLegale', { etichetta: 'Nota in fondo alla pagina', tipo: 'area' }))
      }
    },

    {
      id: 'foto',
      nome: 'Foto',
      titolo: 'Le foto del sito',
      guida: 'Scegli la foto dal computer o dal telefono: viene rimpicciolita e compressa da sola, non serve preparare niente. Va online quando premi "Salva e pubblica".',
      disegna: function (box) {
        box.appendChild(elencoFoto())
        box.appendChild(creaElemento('h3', null, 'Testi della sezione “Lo studio”'))
        box.appendChild(campoTesto('sezioneStudio.eyebrow', { etichetta: 'Riga piccola' }))
        box.appendChild(campoTesto('sezioneStudio.titolo', { etichetta: 'Titolo' }))
        box.appendChild(campoTesto('sezioneStudio.intro', { etichetta: 'Testo sotto il titolo', tipo: 'area' }))
      }
    },

    {
      id: 'collaborazioni',
      nome: 'Collaborazioni',
      titolo: 'I loghi delle collaborazioni',
      guida: 'I loghi delle strutture con cui collabori. Meglio file PNG con lo sfondo trasparente: si adattano da soli al riquadro.',
      disegna: function (box) {
        box.appendChild(campoTesto('sezioneCollaborazioni.titolo', { etichetta: 'Titolo della sezione' }))
        box.appendChild(elencoLoghi())
      }
    },

    {
      id: 'orari',
      nome: 'Orari',
      titolo: 'Gli orari dello studio',
      guida: 'Scrivi l’orario, oppure la parola "chiuso". I giorni chiusi non vengono mandati a Google. Per la pausa pranzo scrivi i due intervalli separati dal punto in mezzo: 9:00 – 13:00 · 15:00 – 18:00.',
      disegna: function (box) {
        box.appendChild(tabellaOrari())
        box.appendChild(creaElemento('h3', null, 'Testi intorno alla tabella'))
        box.appendChild(campoTesto('contatti.titoloOrari', { etichetta: 'Titolo del riquadro' }))
        box.appendChild(campoTesto('contatti.bottoneOrari', { etichetta: 'Bottone sotto la tabella' }))
        box.appendChild(campoTesto('contatti.notaOrari', { etichetta: 'Nota sotto il bottone' }))
      }
    },

    {
      id: 'contatti',
      nome: 'Sezione contatti',
      titolo: 'La sezione “Dove siamo e come prenotare”',
      guida: 'Telefono, indirizzo ed email li prende dalla sezione "Studio e contatti": qui si cambiano solo le scritte che li accompagnano.',
      disegna: function (box) {
        box.appendChild(campoTesto('contatti.eyebrow', { etichetta: 'Riga piccola' }))
        box.appendChild(campoTesto('contatti.titolo', { etichetta: 'Titolo' }))
        box.appendChild(campoTesto('contatti.intro', { etichetta: 'Testo introduttivo', tipo: 'area' }))
        box.appendChild(campoTesto('contatti.sottoTelefono', { etichetta: 'Scritta sotto il telefono' }))
        box.appendChild(campoTesto('contatti.sottoMappa', { etichetta: 'Scritta sotto l’indirizzo' }))
        box.appendChild(campoTesto('contatti.sottoEmail', { etichetta: 'Scritta sotto l’email' }))
        box.appendChild(creaElemento('h3', null, 'Striscia in fondo alle altre pagine'))
        box.appendChild(campoTesto('ctaFinale.titolo', { etichetta: 'Titolo' }))
        box.appendChild(campoTesto('ctaFinale.testo', { etichetta: 'Testo', tipo: 'area', aiuto: 'Scrivendo {telefono} compare il numero, cliccabile.' }))
        box.appendChild(campoTesto('ctaFinale.bottoneMappa', { etichetta: 'Bottone della mappa' }))
      }
    },

    {
      id: 'domande',
      nome: 'Domande frequenti',
      titolo: 'Le domande frequenti',
      guida: 'Sono la pagina "Domande" e vengono lette anche da Google, che può mostrarle direttamente nei risultati di ricerca. Scrivendo {telefono} dentro una risposta compare il numero, cliccabile.',
      disegna: function (box) {
        box.appendChild(elencoSchede('domande', [
          { k: 'domanda', etichetta: 'Domanda' },
          { k: 'risposta', etichetta: 'Risposta', tipo: 'area', righe: 4 }
        ], { nomeVoce: 'Domanda' }))

        box.appendChild(creaElemento('h3', null, 'Testi di apertura della pagina'))
        box.appendChild(campoTesto('paginaDomande.eyebrow', { etichetta: 'Riga piccola' }))
        box.appendChild(campoTesto('paginaDomande.titolo', { etichetta: 'Titolo' }))
        box.appendChild(campoTesto('paginaDomande.lead', { etichetta: 'Testo di apertura', tipo: 'area' }))
        box.appendChild(creaElemento('h3', null, 'Avviso in fondo a ogni pagina'))
        box.appendChild(campoTesto('footer.avviso', { etichetta: 'Avviso di legge', tipo: 'area', aiuto: 'Dice che il sito informa ma non sostituisce la visita. Non va tolto.' }))
      }
    },

    {
      id: 'google',
      nome: 'Google',
      titolo: 'Come il sito appare su Google',
      guida: 'Sono il titolo e la riga di descrizione che si leggono nei risultati di ricerca. Se sono troppo lunghi Google li taglia a metà frase: tieniti dentro i numeri consigliati.',
      disegna: function (box) {
        var pagine = [
          { k: 'home', nome: 'Home' },
          { k: 'prestazioni', nome: 'Pagina Prestazioni' },
          { k: 'domande', nome: 'Pagina Domande' },
          // La privacy non viene mai condivisa su WhatsApp: le bastano
          // titolo e descrizione.
          { k: 'privacy', nome: 'Pagina Privacy', soloBase: true }
        ]
        pagine.forEach(function (p) {
          box.appendChild(creaElemento('h3', null, p.nome))
          box.appendChild(campoTesto('seo.' + p.k + '.titolo', { etichetta: 'Titolo su Google', consigliato: 60 }))
          box.appendChild(campoTesto('seo.' + p.k + '.descrizione', { etichetta: 'Descrizione su Google', tipo: 'area', consigliato: 160 }))
          if (p.soloBase) return
          box.appendChild(campoTesto('seo.' + p.k + '.ogDescrizione', { etichetta: 'Testo quando il link viene condiviso', tipo: 'area', aiuto: 'Quello che si legge sotto l’anteprima su WhatsApp e Facebook.', consigliato: 200 }))
        })
      }
    },

    {
      id: 'pubblicazione',
      nome: 'Pubblicazione',
      titolo: 'Il codice di pubblicazione',
      guida: 'Serve una volta sola, per dispositivo. È il permesso che autorizza questa pagina a modificare il sito: senza, si può guardare e scaricare, non pubblicare.',
      disegna: disegnaPubblicazione
    }
  ]

  /* Riquadro "impostazioni avanzate": aperto solo da chi serve. */
  function avanzate(campi) {
    var box = document.createElement('details')
    box.style.margin = '10px 0 20px'
    var titolo = document.createElement('summary')
    titolo.textContent = 'Impostazioni avanzate (si toccano di rado)'
    titolo.style.cursor = 'pointer'
    titolo.style.fontWeight = '600'
    titolo.style.marginBottom = '10px'
    box.appendChild(titolo)
    campi.forEach(function (c) { box.appendChild(c) })
    return box
  }

  function disegnaPubblicazione(box) {
    var stato = creaElemento('p', 'avviso ' + (codice ? 'avviso-ok' : 'avviso-info'),
      codice
        ? 'Questo dispositivo può pubblicare: il codice è salvato e funziona.'
        : 'Questo dispositivo non può ancora pubblicare. Segui i passi qui sotto, una volta sola.')
    box.appendChild(stato)

    var passi = creaElemento('ol', 'passi')
    var testi = [
      'Apri github.com ed entra con l’account del sito.',
      'Vai su Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.',
      'Nome: "Modifica sito". Scadenza: scegli la più lunga possibile.',
      'In "Repository access" scegli "Only select repositories" e seleziona ' + DEPOSITO.nome + '.',
      'In "Repository permissions" metti Contents su "Read and write". Non serve altro.',
      'Premi "Generate token" e copia il codice che compare: si vede una volta sola.',
      'Incollalo qui sotto e premi "Salva su questo dispositivo".'
    ]
    testi.forEach(function (t) { passi.appendChild(creaElemento('li', null, t)) })
    box.appendChild(passi)

    var apri = creaElemento('a', 'btn btn-ghost', 'Apri la pagina dei codici su GitHub')
    apri.href = 'https://github.com/settings/personal-access-tokens/new'
    apri.target = '_blank'
    apri.rel = 'noopener'
    box.appendChild(apri)

    var campo = creaElemento('div', 'campo')
    campo.style.marginTop = '22px'
    var etichetta = creaElemento('label', null, 'Codice di pubblicazione')
    etichetta.htmlFor = 'campoCodice'
    campo.appendChild(etichetta)
    campo.appendChild(creaElemento('p', 'aiuto', 'Viene cifrato con la tua password e resta su questo dispositivo. Non viene mandato a nessuno tranne che a GitHub.'))
    var input = document.createElement('input')
    input.type = 'password'
    input.id = 'campoCodice'
    input.placeholder = codice ? '(già salvato)' : 'github_pat_...'
    campo.appendChild(input)
    box.appendChild(campo)

    var esito = creaElemento('p', 'aiuto')

    var salva = creaElemento('button', 'btn', 'Salva su questo dispositivo')
    salva.type = 'button'
    salva.addEventListener('click', async function () {
      var valore = input.value.trim()
      if (!valore) { esito.textContent = 'Incolla prima il codice.'; return }
      esito.textContent = 'Controllo…'
      var precedente = codice
      codice = valore
      try {
        var prova = await leggiDaGitHub('contenuti.json')
        if (!prova) throw new Error('Il codice funziona ma non trova il sito. Controlla di aver scelto il deposito giusto.')
        localStorage.setItem(CHIAVE_CODICE, await cifra(valore))
        versione = prova.versione
        esito.textContent = 'Fatto: da adesso questo dispositivo può pubblicare.'
        esito.className = 'nuova'
        input.value = ''
        apriSezione('pubblicazione')
      } catch (errore) {
        codice = precedente
        esito.textContent = errore.message
        esito.className = 'aiuto'
      }
    })
    box.appendChild(salva)

    if (codice) {
      var togli = creaElemento('button', 'btn btn-rosso', 'Togli il codice da questo dispositivo')
      togli.type = 'button'
      togli.style.marginLeft = '8px'
      togli.addEventListener('click', function () {
        if (!confirm('Dopo, da questo dispositivo, non si potrà più pubblicare finché non lo reinserisci. Procedo?')) return
        localStorage.removeItem(CHIAVE_CODICE)
        codice = null
        apriSezione('pubblicazione')
      })
      box.appendChild(togli)
    }
    box.appendChild(esito)

    /* --- Via di scorta: scaricare il file e caricarlo a mano --- */
    box.appendChild(creaElemento('h3', null, 'Senza codice: la via lunga'))
    box.appendChild(creaElemento('p', null,
      'Se il codice non c’è o non funziona, si può comunque scaricare il file delle modifiche e caricarlo a mano su GitHub, trascinandolo nella cartella del sito. Il risultato è lo stesso, ci vogliono solo due passaggi in più.'))

    var scarica = creaElemento('button', 'btn btn-ghost', 'Scarica il file delle modifiche')
    scarica.type = 'button'
    scarica.addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(dati, null, 2)], { type: 'application/json' })
      var link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'contenuti.json'
      link.click()
      URL.revokeObjectURL(link.href)
    })
    box.appendChild(scarica)

    if (codaImmagini.length) {
      box.appendChild(creaElemento('p', 'avviso avviso-info',
        'Attenzione: hai scelto ' + codaImmagini.length + ' immagine/i nuove. Quelle non stanno dentro il file: senza codice di pubblicazione vanno caricate a mano nella cartella img/.'))
    }
  }

  /* -------------------------------------------------------------------
     Impalcatura del pannello
     ---------------------------------------------------------------- */
  function disegnaMenu() {
    var menu = $('menu')
    menu.textContent = ''
    SEZIONI.forEach(function (s) {
      var b = creaElemento('button', null, s.nome)
      b.type = 'button'
      b.dataset.sezione = s.id
      b.addEventListener('click', function () { apriSezione(s.id) })
      menu.appendChild(b)
    })
  }

  function apriSezione(id) {
    sezioneAperta = id
    var sezione = SEZIONI.filter(function (s) { return s.id === id })[0]
    var box = $('contenuto')
    box.textContent = ''
    box.appendChild(creaElemento('h2', null, sezione.titolo))
    if (sezione.guida) box.appendChild(creaElemento('p', 'guida', sezione.guida))
    var corpo = creaElemento('div', 'sezione')
    sezione.disegna(corpo)
    box.appendChild(corpo)
    box.scrollIntoView({ block: 'start' })

    Array.prototype.forEach.call($('menu').children, function (b) {
      b.setAttribute('aria-current', String(b.dataset.sezione === id))
    })
  }

  /* -------------------------------------------------------------------
     Caricamento dei contenuti
     ---------------------------------------------------------------- */
  async function caricaContenuti() {
    if (codice) {
      var daGitHub = await leggiDaGitHub('contenuti.json')
      if (daGitHub) {
        versione = daGitHub.versione
        return JSON.parse(daGitHub.testo)
      }
    }
    var risposta = await fetch('contenuti.json?t=' + Date.now())
    if (!risposta.ok) throw new Error('Non trovo il file dei contenuti (contenuti.json).')
    return await risposta.json()
  }

  function offriBozza() {
    var bozza = null
    try { bozza = localStorage.getItem(CHIAVE_BOZZA) } catch (e) { return }
    if (!bozza) return
    if (bozza === JSON.stringify(dati)) { localStorage.removeItem(CHIAVE_BOZZA); return }
    if (confirm('Sul questo dispositivo ci sono modifiche che non hai mai pubblicato.\n\nOK = riprendi da quelle\nAnnulla = riparti da quello che c’è online')) {
      try {
        dati = JSON.parse(bozza)
        modificato = true
        mostraStato('Modifiche non pubblicate', '')
        return
      } catch (e) { /* bozza rovinata: si riparte da online */ }
    }
    localStorage.removeItem(CHIAVE_BOZZA)
  }

  /* -------------------------------------------------------------------
     Pubblicazione
     ---------------------------------------------------------------- */
  async function pubblica() {
    if (!codice) {
      alert('Questo dispositivo non può ancora pubblicare.\n\nVai nella sezione "Pubblicazione": si fa una volta sola.')
      apriSezione('pubblicazione')
      return
    }

    var bottone = $('bottonePubblica')
    bottone.disabled = true

    try {
      // Prima le immagini: quando arriva il file dei testi, le foto a cui
      // punta devono gia' esserci.
      for (var i = 0; i < codaImmagini.length; i++) {
        mostraStato('Carico le immagini (' + (i + 1) + ' di ' + codaImmagini.length + ')…', '')
        var img = codaImmagini[i]
        await scriviSuGitHub(img.percorso, img.base64, null, 'Nuova immagine dal pannello: ' + img.percorso)
      }
      codaImmagini = []

      mostraStato('Salvo i testi…', '')
      var testo = JSON.stringify(dati, null, 2) + '\n'
      try {
        versione = await scriviSuGitHub('contenuti.json', inBase64(testo), versione, 'Aggiornati i contenuti del sito dal pannello')
      } catch (errore) {
        // Se il file e' cambiato nel frattempo (per esempio da un altro
        // dispositivo) l'identificativo di versione non va piu' bene:
        // lo riprendiamo aggiornato e riproviamo una volta.
        if (!/409|versione|sha/i.test(errore.message)) throw errore
        var attuale = await leggiDaGitHub('contenuti.json')
        versione = await scriviSuGitHub('contenuti.json', inBase64(testo), attuale.versione, 'Aggiornati i contenuti del sito dal pannello')
      }

      modificato = false
      try { localStorage.removeItem(CHIAVE_BOZZA) } catch (e) { /* niente */ }
      mostraStato('Pubblicato. Il sito si aggiorna fra un paio di minuti.', 'ok')
    } catch (errore) {
      mostraStato(errore.message, 'errore')
      alert('Non sono riuscito a pubblicare.\n\n' + errore.message)
    } finally {
      bottone.disabled = false
      if (sezioneAperta === 'pubblicazione') apriSezione('pubblicazione')
    }
  }

  /* -------------------------------------------------------------------
     Accesso
     ---------------------------------------------------------------- */
  $('moduloAccesso').addEventListener('submit', async function (e) {
    e.preventDefault()
    var errore = $('erroreAccesso')
    var bottone = $('bottoneEntra')
    errore.hidden = true
    bottone.disabled = true
    bottone.textContent = 'Controllo…'

    try {
      var email = $('email').value.trim().toLowerCase()
      var password = $('password').value

      var impronta = await improntaPassword(password)
      if (email !== ACCESSO.email || impronta !== ACCESSO.impronta) {
        throw new Error('Email o password non corrette.')
      }

      chiaveCifratura = await derivaChiave(password)

      // Codice di pubblicazione salvato in precedenza su questo dispositivo.
      var salvato = null
      try { salvato = localStorage.getItem(CHIAVE_CODICE) } catch (e2) { /* niente */ }
      if (salvato) {
        try { codice = await decifra(salvato) } catch (e3) { codice = null }
      }

      dati = await caricaContenuti()
      offriBozza()

      $('accesso').hidden = true
      $('pannello').hidden = false
      disegnaMenu()
      apriSezione('studio')
      if (!modificato) {
        mostraStato(codice ? 'Pronto' : 'Pronto — pubblicazione non attiva su questo dispositivo', codice ? 'ok' : '')
      }
    } catch (problema) {
      errore.textContent = problema.message
      errore.hidden = false
    } finally {
      bottone.disabled = false
      bottone.textContent = 'Entra'
    }
  })

  $('bottonePubblica').addEventListener('click', pubblica)

  $('bottoneEsci').addEventListener('click', function () {
    if (modificato && !confirm('Hai modifiche non pubblicate. Restano salvate su questo dispositivo e le ritrovi al prossimo accesso. Esco?')) return
    location.reload()
  })

  // Chiudere la scheda con modifiche non pubblicate: il browser chiede conferma.
  window.addEventListener('beforeunload', function (e) {
    if (!modificato) return
    e.preventDefault()
    e.returnValue = ''
  })

})()
