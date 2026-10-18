/* =====================================================================
   NUCLEO DEL GENERATORE — testo dentro, testo fuori
   =====================================================================

   Cosa fa
       una funzione sola: generaPagina(html, contenuti). Prende l'HTML di
       una pagina, ci riscrive dentro i testi di contenuti.json e
       restituisce l'HTML nuovo. Non legge e non scrive file, non stampa
       niente: e' solo la regola di trasformazione.

   Perche' sta in un file a parte
       perche' la stessa regola serve in due posti:
         - node genera.mjs, che riscrive i file veri;
         - admin.html, che disegna l'anteprima mentre si scrive.
       Se fossero due copie, prima o poi l'anteprima mostrerebbe una cosa
       e il sito ne pubblicherebbe un'altra. Meglio un file solo, usato
       da tutti e due.

   Come viene caricato
       nel browser:  <script src="genera-nucleo.js"></script>
       in Node:      import './genera-nucleo.js'
       In tutti e due i casi lascia globalThis.NucleoGenera.

   ---------------------------------------------------------------------
   I SEGNAPOSTO NELL'HTML — l'unica cosa da sapere per metterci mano
   ---------------------------------------------------------------------

   1. TESTO SEMPLICE
        <!--T:home.titolo-->Visite dermatologiche...<!--/T-->
      Quello che sta in mezzo viene riscritto col valore di
      contenuti.json alla chiave home.titolo. Fra i due commenti non
      mettere tag: si perdono.

   2. BLOCCHI RIPETUTI (elenchi, schede, righe di tabella)
        <!--B:orari-->...<!--/B-->
      Li disegna una funzione di questo file (vedi BLOCCHI in fondo).
      Tutto cio' che sta fra i due commenti viene buttato e riscritto.
      Dopo i due punti si puo' passare un'indicazione al blocco:
        <!--B:menu:domande.html-->  (il menu visto dalla pagina Domande)
      La home e' fatta quasi solo di blocchi: <!--B:hero--> e
      <!--B:sezioniHome-->, che disegna le sezioni scelte nel pannello
      con le funzioni di SEZIONE.

   3. TESTO DI UN TAG INTERO
        <title data-t="seo.home.titolo">...</title>
      Serve dove un commento HTML non funziona: dentro <title> il
      browser lo leggerebbe come testo e lo mostrerebbe nella linguetta.

   4. ATTRIBUTI (href, src, alt, content, placeholder)
        <a data-c="tel" href="tel:+39...">
        <img data-c="foto.studio" src="..." alt="...">
      La tabella ATTRIBUTI dice quali attributi riscrivere per ogni
      chiave.

   Dentro i testi si puo' scrivere {telefono}: diventa il numero
   cliccabile. Utile nelle risposte alle domande frequenti.
   ===================================================================== */

(function (globale) {
  'use strict'

  /* ---------------------------------------------------------------
     LE SEZIONI DELLA HOME
     ---------------------------------------------------------------
     Sotto la prima schermata, la home e' un elenco di sezioni
     (contenuti.json, campo sezioniHome): si mostrano, si nascondono,
     si spostano e se ne aggiungono di nuove dal pannello. Le cinque
     sezioni "di serie" si possono solo nascondere, cosi' i loro testi
     non vanno persi; quelle "libere" si possono anche togliere.

     Restano fuori dall'elenco, e quindi sempre presenti, la prima
     schermata (il titolo <h1>, la frase piu' importante per Google)
     e il footer con i dati obbligatori per legge.
     ------------------------------------------------------------ */
  var TIPI_SEZIONE = {
    medico: { nome: 'Il medico', ancora: 'chi-sono', pannello: 'medico', titolo: function (c) { return c.chiSono.titolo } },
    prestazioni: { nome: 'Prestazioni (carosello)', ancora: 'prestazioni', pannello: 'prestazioni', titolo: function (c) { return c.sezionePrestazioni.titolo } },
    studio: { nome: 'Lo studio (foto)', ancora: 'studio', pannello: 'foto', titolo: function (c) { return c.sezioneStudio.titolo } },
    collaborazioni: { nome: 'Collaborazioni (loghi)', ancora: 'collaborazioni', pannello: 'collaborazioni', titolo: function (c) { return c.sezioneCollaborazioni.titolo } },
    contatti: { nome: 'Dove siamo e orari', ancora: 'contatti', pannello: 'contatti', titolo: function (c) { return c.contatti.titolo } },
    libera: { nome: 'Sezione libera', titolo: function (c, s) { return s.titolo } }
  }

  /* ---------------------------------------------------------------
     LE PAGINE
     ---------------------------------------------------------------
     Oltre alla home (sempre) e alla privacy (sempre: l'informativa e'
     obbligatoria), contenuti.json ha un elenco "pagine":
       - Prestazioni e Domande, di serie: si possono nascondere. Una
         pagina nascosta non e' piu' collegata da nessuna parte del sito,
         esce dalla sitemap e dice a Google di non indicizzarla; il file
         resta, perche' e' anche lo stampo da cui si rigenera.
       - pagine "libere": si aggiungono e si tolgono dal pannello. Le
         scrive genera.mjs partendo da modello-pagina.html; una pagina
         libera tolta o nascosta viene cancellata dal sito.
     ------------------------------------------------------------ */
  var PAGINE_DI_SERIE = {
    prestazioni: { file: 'prestazioni.html', nome: 'Prestazioni', pannello: 'prestazioni' },
    domande: { file: 'domande.html', nome: 'Domande frequenti', pannello: 'domande' }
  }

  /* Nomi di file che una pagina libera non puo' prendere. */
  var FILE_RISERVATI = ['index.html', 'prestazioni.html', 'domande.html', 'privacy.html', '404.html', 'admin.html', 'modello-pagina.html']

  /* Toglie accenti e maiuscole. Stessa normalizzazione della ricerca
     in script.js, cosi' "psoriasi" trova anche "Psoriàsi". */
  function normalizza(t) {
    return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  }

  /* "Ferie d'agosto" -> "ferie-d-agosto": l'indirizzo di una sezione
     (dermozanetta.it/#ferie-d-agosto) o di una pagina (tariffe.html). */
  function slug(t, riserva) {
    return normalizza(t).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/-+$/, '') || riserva
  }

  /* Il file di una pagina. Quello di una pagina libera si decide alla
     prima pubblicazione (dal titolo) e poi resta fisso: cambiare il
     titolo non deve rompere i link gia' dati in giro. */
  function fileDellaPagina(p) {
    if (PAGINE_DI_SERIE[p.tipo]) return PAGINE_DI_SERIE[p.tipo].file
    return p.file || slug(p.titolo, 'pagina') + '.html'
  }

  /* Assegna il file alle pagine libere che non l'hanno ancora, senza
     scontrarsi con i nomi gia' presi. La chiama il pannello prima di
     pubblicare. */
  function fissaFilePagine(c) {
    var presi = FILE_RISERVATI.concat(c.pagine.filter(function (p) { return p.file }).map(function (p) { return p.file }))
    c.pagine.forEach(function (p) {
      if (p.tipo !== 'libera' || p.file) return
      var base = slug(p.titolo, 'pagina'), file = base + '.html', n = 2
      while (presi.indexOf(file) !== -1) file = base + '-' + n++ + '.html'
      p.file = file
      presi.push(file)
    })
    return c
  }

  /* Le pagine a cui puo' portare una voce del menu, oltre alle sezioni:
     di serie (il valore e' il nome del file, come prima) e libere (il
     valore e' l'identificativo, che resta lo stesso se cambia il file). */
  function sceltePagine(c) {
    return c.pagine.map(function (p) {
      var serie = PAGINE_DI_SERIE[p.tipo]
      return {
        dove: serie ? serie.file : p.id,
        nome: 'Pagina ' + (serie ? serie.nome : (pieno(p.titolo) ? p.titolo : 'senza titolo')),
        visibile: p.visibile !== false
      }
    })
  }

  /* Com'era il sito prima che sezioni, menu e pagine diventassero
     modificabili: un contenuti.json senza questi campi (o una bozza
     vecchia rimasta nel browser) si comporta esattamente come prima. */
  var SEZIONI_DI_SERIE = ['medico', 'prestazioni', 'studio', 'collaborazioni', 'contatti']
  var MENU_DI_SERIE = [
    { testo: 'Il medico', dove: 'medico' },
    { testo: 'Prestazioni', dove: 'prestazioni.html' },
    { testo: 'Lo studio', dove: 'studio' },
    { testo: 'Domande', dove: 'domande.html' },
    { testo: 'Dove siamo', dove: 'contatti' }
  ]

  function completaSezioneLibera(s) {
    if (s.visibile === undefined) s.visibile = true
    if (s.eyebrow == null) s.eyebrow = ''
    if (s.titolo == null) s.titolo = ''
    if (!Array.isArray(s.paragrafi)) s.paragrafi = []
    if (!Array.isArray(s.punti)) s.punti = []
    if (!s.foto) s.foto = { file: '', alt: '' }
    if (!s.bottone) s.bottone = { testo: '', link: '' }
    return s
  }

  function completa(c) {
    if (!Array.isArray(c.sezioniHome)) {
      c.sezioniHome = SEZIONI_DI_SERIE.map(function (t) { return { id: t, tipo: t, visibile: true } })
    }
    if (!Array.isArray(c.menu)) c.menu = JSON.parse(JSON.stringify(MENU_DI_SERIE))
    if (!Array.isArray(c.pagine)) {
      // "pagina-…": l'identificativo non deve confondersi con quello della
      // sezione omonima della home (la sezione "prestazioni" e' un'altra cosa).
      c.pagine = Object.keys(PAGINE_DI_SERIE).map(function (t) { return { id: 'pagina-' + t, tipo: t, visibile: true } })
    }
    c.sezioniHome.forEach(function (s) {
      if (s.tipo === 'libera') completaSezioneLibera(s)
      else if (s.visibile === undefined) s.visibile = true
    })
    c.pagine.forEach(function (p) {
      if (p.visibile === undefined) p.visibile = true
      if (p.tipo !== 'libera') return
      ;['file', 'titolo', 'eyebrow', 'lead', 'seoTitolo', 'seoDescrizione'].forEach(function (k) { if (p[k] == null) p[k] = '' })
      if (!Array.isArray(p.sezioni)) p.sezioni = []
      p.sezioni.forEach(completaSezioneLibera)
    })
    return c
  }

  /* C'e' qualcosa di scritto? Spazi e a capo non contano. */
  function pieno(t) { return String(t == null ? '' : t).trim() !== '' }

  /* Una pagina e' online? Home e privacy sempre; le altre se visibili. */
  function paginaOnline(c, file) {
    if (file === 'index.html' || file === 'privacy.html') return true
    return c.pagine.some(function (p) { return p.visibile !== false && fileDellaPagina(p) === file })
  }

  /* Dove puo' portare il bottone di una sezione libera: le scorciatoie
     dei dati dello studio, una pagina del sito che c'e', o un indirizzo
     https. */
  function eLinkBottone(l, c) {
    l = String(l || '').trim()
    if (['{telefono}', '{mappa}', '{email}'].indexOf(l) !== -1) return true
    if (/\.html$/.test(l)) return paginaOnline(c, l)
    return /^https:\/\/[^\s"'<>]+$/.test(l)
  }

  /* idPagina: solo per le pagine libere, che si costruiscono tutte dallo
     stesso stampo (modello-pagina.html) e qui scoprono quale sono. */
  function creaMotore(c, idPagina) {

    var PAGINA = idPagina ? c.pagine.filter(function (p) { return p.id === idPagina })[0] : null
    if (idPagina && !PAGINA) throw new Error('pagina sconosciuta: ' + idPagina)

    /* ---------------------------------------------------------------
       Utilita'
       ------------------------------------------------------------ */

    /* Quello che finisce in pagina e' testo, non codice: se qualcuno
       scrive "<" o "&" in un testo deve restare un carattere visibile. */
    function esc(t) {
      return String(t == null ? '' : t)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    }

    /* Il numero come si legge in pagina, con spazi che non vanno a
       capo: "351 511" su una riga e "8880" sulla successiva non si
       riesce piu' a leggere come un numero solo. */
    function telefono() {
      return esc(c.studio.telefonoVisibile).replace(/ /g, '&nbsp;')
    }

    /* {telefono} dentro un testo diventa il numero, cliccabile. */
    function conTelefono(t) {
      return esc(t).replace(
        /\{telefono\}/g,
        '<a href="tel:' + esc(c.studio.telefonoLink) + '">' + telefono() + '</a>'
      )
    }

    /* "home.titolo" -> c.home.titolo. Se la chiave non esiste ci si
       ferma: meglio un errore chiaro che un buco nella pagina. */
    function valore(chiave) {
      var v = chiave.split('.').reduce(function (o, k) { return o == null ? o : o[k] }, c)
      if (v === undefined) throw new Error('chiave assente in contenuti.json: ' + chiave)
      return v
    }

    function indirizzoCompleto() {
      return c.studio.via + ', ' + c.studio.cap + ' ' + c.studio.citta + ' (' + c.studio.provincia + ')'
    }

    /* Rientro uguale davanti a ogni riga di un pezzo di HTML gia'
       pronto: i blocchi annidati restano leggibili come scritti a mano. */
    function rientra(html, spazi) {
      var margine = new Array(spazi + 1).join(' ')
      return html.split('\n').map(function (r) { return r ? margine + r : r }).join('\n')
    }

    /* Mette in fila le righe di una sezione saltando quelle vuote: e'
       cosi' che un testo facoltativo lasciato vuoto sparisce dalla
       pagina invece di lasciare un paragrafo vuoto. */
    function unisci(righe) {
      return righe.filter(function (r) { return r }).join('\n')
    }

    /* L'indirizzo di ogni sezione dentro la sua pagina (#ferie-d-agosto).
       Mai uno gia' usato: una sezione libera intitolata "Contatti" non
       puo' prendere #contatti, che e' gia' di un'altra. */
    function calcolaAncore(sezioni) {
      var giaUsate = ['top', 'nav', 'navtoggle', 'main', 'elencoprestazioni', 'year', 'cerca', 'esitoricerca']
        .concat(Object.keys(TIPI_SEZIONE).map(function (t) { return TIPI_SEZIONE[t].ancora }).filter(Boolean))
      var ancore = {}
      sezioni.forEach(function (s) {
        if (s.tipo !== 'libera') { ancore[s.id] = TIPI_SEZIONE[s.tipo].ancora; return }
        var base = slug(s.titolo, 'sezione'), ancora = base, n = 2
        while (giaUsate.indexOf(ancora) !== -1) ancora = base + '-' + n++
        giaUsate.push(ancora)
        ancore[s.id] = ancora
      })
      return ancore
    }

    var ANCORE = calcolaAncore(c.sezioniHome)
    var ANCORE_PAGINA = PAGINA ? calcolaAncore(PAGINA.sezioni) : {}

    function online(file) { return paginaOnline(c, file) }

    /* Le sezioni che finiscono davvero in pagina: visibili, e con
       qualcosa dentro (Collaborazioni senza nessun logo non si mostra). */
    var MOSTRATE = c.sezioniHome.filter(function (s) {
      if (s.visibile === false || !TIPI_SEZIONE[s.tipo]) return false
      if (s.tipo === 'collaborazioni' && !(c.loghi || []).length) return false
      return true
    })

    function mostrata(id) {
      return MOSTRATE.some(function (s) { return s.id === id })
    }

    /* Voci del menu in alto. Una voce che porta a una sezione nascosta
       non si scrive: un link che non porta da nessuna parte e' peggio
       di un link in meno. Nelle pagine interne le sezioni stanno in
       index.html, da qui il prefisso; la voce della pagina in cui ci si
       trova e' segnata per i lettori di schermo (aria-current). */
    function vociMenu(paginaCorrente) {
      var prefisso = paginaCorrente ? 'index.html' : ''
      return (c.menu || []).map(function (v) {
        var href = hrefVoce(v.dove, prefisso)
        if (!href) return null
        var corrente = href === paginaCorrente ? ' aria-current="page"' : ''
        return '<a href="' + esc(href) + '"' + corrente + '>' + esc(v.testo) + '</a>'
      }).filter(Boolean).join('\n')
    }

    /* Dove porta una voce del menu, o null se porta a qualcosa che oggi
       non si vede (sezione o pagina nascosta). */
    function hrefVoce(dove, prefisso) {
      if (/\.html$/.test(dove)) return online(dove) ? dove : null
      if (mostrata(dove)) return prefisso + '#' + ANCORE[dove]
      var pagina = c.pagine.filter(function (p) { return p.id === dove && p.visibile !== false })[0]
      return pagina ? fileDellaPagina(pagina) : null
    }

    /* Il bottone di una sezione libera: {telefono}, {mappa} ed {email}
       sono scorciatoie per i dati dello studio, cosi' non vanno
       riscritti (e corretti) a mano in due posti. */
    function linkBottone(l) {
      l = String(l || '').trim()
      if (l === '{telefono}') return { href: 'tel:' + c.studio.telefonoLink }
      if (l === '{mappa}') return { href: c.studio.mappaUrl, fuori: true }
      if (l === '{email}') return { href: 'mailto:' + c.studio.email }
      return { href: l, fuori: /^https:\/\//.test(l) }
    }

    /* ---------------------------------------------------------------
       Le sezioni della home, una funzione per tipo. "alt" e' lo sfondo
       sabbia: si alterna da solo, una si' e una no, qualunque sia
       l'ordine o il numero delle sezioni mostrate.
       ------------------------------------------------------------ */
    var SEZIONE = {

      medico: function (alt) {
        var punti = c.chiSono.punti.filter(pieno)
        return unisci([
          '<section id="chi-sono" class="section' + alt + '">',
          '  <div class="wrap narrow">',
          pieno(c.chiSono.eyebrow) && '    <p class="eyebrow">' + esc(c.chiSono.eyebrow) + '</p>',
          '    <h2>' + esc(c.chiSono.titolo) + '</h2>',
          rientra(BLOCCHI.paragrafiChiSono(), 4),
          punti.length && unisci(['    <ul class="check-list">', rientra(BLOCCHI.puntiChiSono(), 6), '    </ul>']),
          '  </div>',
          '</section>'
        ])
      },

      /* Carosello: tre schede visibili, si scorre per le altre. Ci sono
         tutte le prestazioni, nell'ordine del pannello; l'elenco completo
         con la ricerca resta su prestazioni.html. La barra sotto la pista
         dice che c'e' altro e si puo' trascinare: la riempie script.js. */
      prestazioni: function (alt) {
        var p = c.sezionePrestazioni
        return unisci([
          '<section id="prestazioni" class="section' + alt + '">',
          '  <div class="wrap">',
          pieno(p.eyebrow) && '    <p class="eyebrow center">' + esc(p.eyebrow) + '</p>',
          '    <h2 class="center">' + esc(p.titolo) + '</h2>',
          pieno(p.intro) && '    <p class="section-intro center">' + conTelefono(p.intro) + '</p>',
          '    <div class="carosello">',
          '      <div class="cards carosello-pista" id="elencoPrestazioni" tabindex="0" role="group" aria-label="Prestazioni, scorrevoli lateralmente">',
          rientra(BLOCCHI.prestazioni(), 8),
          '      </div>',
          '      <div class="carosello-barra" hidden><span></span></div>',
          '    </div>',
          // Il rimando alla pagina Prestazioni c'e' solo se la pagina c'e'.
          online('prestazioni.html') && unisci([
            '    <noscript>',
            '      <p class="section-intro center">',
            '        <a href="prestazioni.html">Apri l&rsquo;elenco completo delle prestazioni</a>.',
            '      </p>',
            '    </noscript>'
          ]),
          online('prestazioni.html') && pieno(p.bottone) && unisci([
            '    <p class="center azione-sezione">',
            '      <a class="btn btn-ghost" href="prestazioni.html">' + esc(p.bottone) + '</a>',
            '    </p>'
          ]),
          '  </div>',
          '</section>'
        ])
      },

      studio: function (alt) {
        var s = c.sezioneStudio
        return unisci([
          '<section id="studio" class="section' + alt + '">',
          '  <div class="wrap">',
          pieno(s.eyebrow) && '    <p class="eyebrow center">' + esc(s.eyebrow) + '</p>',
          '    <h2 class="center">' + esc(s.titolo) + '</h2>',
          pieno(s.intro) && '    <p class="section-intro center">' + conTelefono(s.intro) + '</p>',
          '    <div class="gallery">',
          rientra(BLOCCHI.galleria(), 6),
          '    </div>',
          '  </div>',
          '</section>'
        ])
      },

      /* Titolo unico: l'occhiello fa anche da intestazione (h2), cosi' la
         sezione resta navigabile dai lettori di schermo pur avendo una
         riga sola sopra i loghi. */
      collaborazioni: function (alt) {
        return unisci([
          '<section id="collaborazioni" class="section' + alt + '">',
          '  <div class="wrap">',
          '    <h2 class="eyebrow center">' + esc(c.sezioneCollaborazioni.titolo) + '</h2>',
          '    <div class="logos">',
          rientra(BLOCCHI.loghi(), 6),
          '    </div>',
          '  </div>',
          '</section>'
        ])
      },

      contatti: function (alt) {
        var k = c.contatti
        return unisci([
          '<section id="contatti" class="section' + alt + '">',
          '  <div class="wrap two-col">',
          '    <div>',
          pieno(k.eyebrow) && '      <p class="eyebrow">' + esc(k.eyebrow) + '</p>',
          '      <h2>' + esc(k.titolo) + '</h2>',
          pieno(k.intro) && '      <p class="section-intro">' + conTelefono(k.intro) + '</p>',
          '      <div class="contact-list">',
          rientra(BLOCCHI.contatti(), 8),
          '      </div>',
          '    </div>',
          '    <div class="hours-card">',
          pieno(k.titoloOrari) && '      <h3>' + esc(k.titoloOrari) + '</h3>',
          '      <table class="hours">',
          '        <tbody>',
          rientra(BLOCCHI.orari(), 10),
          '        </tbody>',
          '      </table>',
          pieno(k.bottoneOrari) && rientra(BLOCCHI.bottoneOrari(), 6),
          pieno(k.notaOrari) && '      <p class="note">' + esc(k.notaOrari) + '</p>',
          '    </div>',
          '  </div>',
          '</section>'
        ])
      },

      /* Sezione libera: titolo obbligatorio, tutto il resto facoltativo.
         E' testo, non HTML: si puo' scrivere {telefono} e diventa il
         numero cliccabile, nient'altro. */
      libera: function (alt, s, ancore) {
        var punti = s.punti.filter(pieno)
        var bottone = pieno(s.bottone.testo) && pieno(s.bottone.link) && linkBottone(s.bottone.link)
        return unisci([
          '<section id="' + esc((ancore || ANCORE)[s.id]) + '" class="section' + alt + '">',
          '  <div class="wrap narrow">',
          pieno(s.eyebrow) && '    <p class="eyebrow">' + esc(s.eyebrow) + '</p>',
          '    <h2>' + esc(s.titolo) + '</h2>',
          unisci(s.paragrafi.filter(pieno).map(function (t) { return '    <p>' + conTelefono(t) + '</p>' })),
          punti.length && unisci(['    <ul class="check-list">'].concat(
            punti.map(function (t) { return '      <li>' + conTelefono(t) + '</li>' }), ['    </ul>'])),
          pieno(s.foto.file) && unisci([
            '    <figure class="sezione-foto">',
            '      <img src="' + esc(s.foto.file) + '" alt="' + esc(s.foto.alt) + '" width="900" height="600" loading="lazy">',
            '    </figure>'
          ]),
          bottone && unisci([
            '    <p class="azione-sezione">',
            '      <a class="btn btn-ghost" href="' + esc(bottone.href) + '"' + (bottone.fuori ? ' target="_blank" rel="noopener"' : '') + '>' + esc(s.bottone.testo) + '</a>',
            '    </p>'
          ]),
          '  </div>',
          '</section>'
        ])
      }
    }

    /* ---------------------------------------------------------------
       1. Testi semplici:  <!--T:chiave-->...<!--/T-->
       ------------------------------------------------------------ */
    function scriviTesti(html) {
      return html.replace(/<!--T:([\w.]+)-->[\s\S]*?<!--\/T-->/g, function (_, chiave) {
        return '<!--T:' + chiave + '-->' + esc(valore(chiave)) + '<!--/T-->'
      })
    }

    /* ---------------------------------------------------------------
       2. Testo di un tag intero:  <title data-t="chiave">...</title>
       ------------------------------------------------------------ */
    function scriviTestiTag(html) {
      return html.replace(
        /<([a-zA-Z0-9]+)([^>]*\bdata-t="([\w.]+)"[^>]*)>[\s\S]*?<\/\1>/g,
        function (_, tag, attributi, chiave) {
          return '<' + tag + attributi + '>' + esc(valore(chiave)) + '</' + tag + '>'
        }
      )
    }

    /* ---------------------------------------------------------------
       3. Blocchi ripetuti:  <!--B:nome-->...<!--/B-->
       L'indentazione viene ripresa dalla riga del segnaposto, cosi'
       l'HTML generato resta leggibile come quello scritto a mano.
       ------------------------------------------------------------ */
    /* Un blocco puo' ricevere un'indicazione dopo i due punti:
       <!--B:menu:domande.html--> e' il menu visto dalla pagina Domande,
       che segna quella voce come pagina corrente. */
    function scriviBlocchi(html) {
      return html.replace(/([ \t]*)<!--B:([\w.]+)(?::([\w.-]+))?-->[\s\S]*?<!--\/B-->/g, function (_, indent, nome, dettaglio) {
        var disegna = BLOCCHI[nome]
        if (!disegna) throw new Error('blocco sconosciuto: ' + nome)
        var righe = disegna(dettaglio).split('\n').map(function (r) {
          return r ? indent + r : r
        }).join('\n')
        var segnaposto = nome + (dettaglio ? ':' + dettaglio : '')
        return indent + '<!--B:' + segnaposto + '-->\n' + righe + '\n' + indent + '<!--/B-->'
      })
    }

    /* ---------------------------------------------------------------
       4. Attributi:  <tag data-c="chiave" ...>
       ------------------------------------------------------------ */
    function tabellaAttributi() {
      return {
        'tel': { href: 'tel:' + c.studio.telefonoLink },
        'mail': { href: 'mailto:' + c.studio.email },
        'mappa': { href: c.studio.mappaUrl },

        'foto.dottoressa': { src: c.foto.dottoressa.file, alt: c.foto.dottoressa.alt },
        // Il <link rel="preload"> deve seguire la foto: se il ritratto
        // cambia dal pannello e questo resta indietro, il browser scarica
        // per prima una foto che non usa piu'.
        'foto.precarica': { href: c.foto.dottoressa.file },
        'foto.ritrattoOg': { content: c.studio.sito.replace(/\/$/, '') + '/' + c.foto.dottoressa.file },
        'foto.ritrattoOgAlt': { content: c.foto.dottoressa.alt },

        'seo.home.descrizione': { content: c.seo.home.descrizione },
        'seo.home.ogTitolo': { content: c.seo.home.titolo },
        'seo.home.ogDescrizione': { content: c.seo.home.ogDescrizione },
        'seo.prestazioni.descrizione': { content: c.seo.prestazioni.descrizione },
        'seo.prestazioni.ogTitolo': { content: c.seo.prestazioni.titolo },
        'seo.prestazioni.ogDescrizione': { content: c.seo.prestazioni.ogDescrizione },
        'seo.domande.descrizione': { content: c.seo.domande.descrizione },
        'seo.domande.ogTitolo': { content: c.seo.domande.titolo },
        'seo.domande.ogDescrizione': { content: c.seo.domande.ogDescrizione },
        'seo.privacy.descrizione': { content: c.seo.privacy.descrizione },
        'seo.sitoNome': { content: c.studio.nomeMedico + ' — Dermatologa' },

        'ricerca.suggerimento': { placeholder: c.paginaPrestazioni.suggerimentoRicerca }
      }
    }

    function scriviAttributi(html) {
      var tabella = tabellaAttributi()
      Object.keys(tabella).forEach(function (chiave) {
        var attributi = tabella[chiave]
        var cercaTag = new RegExp('<[^>]*\\sdata-c="' + chiave.replace(/\./g, '\\.') + '"[^>]*>', 'g')
        html = html.replace(cercaTag, function (tag) {
          Object.keys(attributi).forEach(function (nome) {
            var cercaAttr = new RegExp('\\s' + nome + '="[^"]*"')
            var nuovo = ' ' + nome + '="' + esc(attributi[nome]) + '"'
            tag = cercaAttr.test(tag)
              ? tag.replace(cercaAttr, nuovo)
              : tag.replace(/\s*\/?>$/, function (m) { return nuovo + m })
          })
          return tag
        })
      })
      return html
    }

    /* ---------------------------------------------------------------
       I blocchi
       ------------------------------------------------------------ */
    var BLOCCHI = {

      /* Schede delle prestazioni. data-cerca contiene nome, testo e
         chiavi gia' senza accenti: e' il testo su cui lavora la ricerca
         di prestazioni.html. Le chiavi non si vedono in pagina, servono
         solo a far trovare la scheda (chi ha l'acne cerca "brufoli"). */
      prestazioni: function () {
        return c.prestazioni.map(function (p) {
          var cerca = normalizza(p.nome + ' ' + p.testo + ' ' + (p.chiavi || '')).replace(/\s+/g, ' ').trim()
          return [
            '<article class="card" data-cerca="' + esc(cerca) + '">',
            '  <h3>' + esc(p.nome) + '</h3>',
            '  <p>' + esc(p.testo) + '</p>',
            '</article>'
          ].join('\n')
        }).join('\n')
      },

      paragrafiChiSono: function () {
        return c.chiSono.paragrafi.filter(pieno).map(function (t) { return '<p>' + conTelefono(t) + '</p>' }).join('\n')
      },

      puntiChiSono: function () {
        return c.chiSono.punti.filter(pieno).map(function (t) { return '<li>' + conTelefono(t) + '</li>' }).join('\n')
      },

      /* Prima schermata della home. Il titolo (h1) c'e' sempre; riga
         piccola, frase sotto, bottoni e nota spariscono se lasciati
         vuoti. "Vedi le prestazioni" porta al carosello, o alla pagina
         Prestazioni se il carosello e' nascosto. */
      hero: function () {
        var h = c.home
        // "Vedi le prestazioni": al carosello, o alla pagina se il carosello
        // e' nascosto; se mancano tutti e due, il bottone non c'e'.
        var destinazionePrestazioni = mostrata('prestazioni') ? '#prestazioni' : online('prestazioni.html') ? 'prestazioni.html' : null
        return unisci([
          '<section class="hero">',
          '  <div class="wrap hero-inner">',
          '    <div class="hero-text">',
          pieno(h.eyebrow) && '      <p class="eyebrow">' + esc(h.eyebrow) + '</p>',
          '      <h1>' + esc(h.titolo) + '</h1>',
          pieno(h.lead) && '      <p class="lead">' + conTelefono(h.lead) + '</p>',
          '      <div class="hero-cta">',
          rientra(BLOCCHI.bottoneChiama(), 8),
          pieno(h.bottonePrestazioni) && destinazionePrestazioni && '        <a class="btn btn-ghost" href="' + destinazionePrestazioni + '">' + esc(h.bottonePrestazioni) + '</a>',
          // Porta alla scheda Google dello studio: mappa, indicazioni e recensioni.
          pieno(h.bottoneMappa) && '        <a class="btn btn-ghost" data-c="mappa" href="' + esc(c.studio.mappaUrl) + '" target="_blank" rel="noopener">' + esc(h.bottoneMappa) + '</a>',
          '      </div>',
          pieno(h.nota) && '      <p class="hero-note">' + conTelefono(h.nota) + '</p>',
          '    </div>',
          '    <figure class="hero-photo">',
          '      <img fetchpriority="high" data-c="foto.dottoressa" src="' + esc(c.foto.dottoressa.file) + '" alt="' + esc(c.foto.dottoressa.alt) + '" width="520" height="620">',
          '    </figure>',
          '  </div>',
          '</section>'
        ])
      },

      /* Tutte le sezioni della home sotto la prima schermata, nell'ordine
         e con la visibilita' decisi nel pannello. */
      sezioniHome: function () {
        return MOSTRATE.map(function (s, i) {
          return SEZIONE[s.tipo](i % 2 === 0 ? ' section-alt' : '', s)
        }).join('\n\n')
      },

      /* Menu in alto: <!--B:menu--> nella home, dove le sezioni sono
         ancore (#studio); <!--B:menu:pagina.html--> nelle altre, dove
         portano alla home (index.html#studio). */
      menu: function (paginaCorrente) {
        return vociMenu(paginaCorrente || (PAGINA ? fileDellaPagina(PAGINA) : ''))
      },

      /* <!--B:robots:prestazioni.html--> in testa a una pagina di serie:
         vuoto finche' la pagina e' visibile; se e' nascosta dice a Google
         di toglierla dai risultati (il file resta: e' lo stampo). */
      robots: function (file) {
        return online(file) ? '' : '<meta name="robots" content="noindex, follow">'
      },

      /* I rimandi della pagina 404: solo verso pagine che ci sono. Gli
         indirizzi partono da "/" perche' la 404 si vede a qualunque
         profondita' (/vecchia/pagina/). */
      link404: function () {
        var voci = ['<li><a href="/">Home</a> — chi visita, dove si trova lo studio, gli orari</li>']
        if (online('prestazioni.html')) voci.push('<li><a href="/prestazioni.html">Prestazioni</a> — di cosa si occupa lo studio</li>')
        if (online('domande.html')) voci.push('<li><a href="/domande.html">Domande frequenti</a> — cosa portare, quanto dura</li>')
        c.pagine.forEach(function (p) {
          if (p.tipo === 'libera' && p.visibile !== false) {
            voci.push('<li><a href="/' + esc(fileDellaPagina(p)) + '">' + esc(p.titolo) + '</a></li>')
          }
        })
        return voci.join('\n')
      },

      /* ---- Pagine libere (stampo: modello-pagina.html) ---- */

      /* Lo stampo, aperto da solo, e' una pagina vuota con "noindex":
         nelle copie vere il divieto sparisce. */
      robotsPagina: function () { return '' },

      /* Titolo, descrizione e anteprima social. Se il titolo per Google o
         la descrizione restano vuoti, si ricavano dal titolo e dal testo
         di apertura della pagina. */
      testaPagina: function () {
        var p = PAGINA
        var base = c.studio.sito.replace(/\/$/, '')
        var indirizzo = base + '/' + fileDellaPagina(p)
        var titolo = pieno(p.seoTitolo) ? p.seoTitolo : p.titolo + ' — ' + c.studio.nomeMedico + ', dermatologa a ' + c.studio.citta
        var descrizione = pieno(p.seoDescrizione) ? p.seoDescrizione : p.lead
        return unisci([
          '<title>' + esc(titolo) + '</title>',
          pieno(descrizione) && '<meta name="description" content="' + esc(descrizione) + '">',
          '<link rel="canonical" href="' + esc(indirizzo) + '">',
          '<meta property="og:title" content="' + esc(titolo) + '">',
          pieno(descrizione) && '<meta property="og:description" content="' + esc(descrizione) + '">',
          '<meta property="og:type" content="website">',
          '<meta property="og:locale" content="it_IT">',
          '<meta property="og:site_name" content="' + esc(c.studio.nomeMedico) + ' — Dermatologa">',
          '<meta property="og:url" content="' + esc(indirizzo) + '">',
          '<meta property="og:image" content="' + esc(base + '/' + c.foto.dottoressa.file) + '">',
          '<meta property="og:image:alt" content="' + esc(c.foto.dottoressa.alt) + '">',
          '<meta name="twitter:card" content="summary_large_image">'
        ])
      },

      /* Testata della pagina, le sue sezioni e la striscia "Prenotare e'
         una telefonata" in fondo. Gli sfondi si alternano partendo chiari
         sotto la testata; la striscia finale prende sempre il colore
         opposto all'ultima sezione. */
      contenutoPagina: function () {
        var p = PAGINA
        var sezioni = p.sezioni.filter(function (s) { return s.visibile !== false })
        var altFinale = sezioni.length % 2 === 1 || sezioni.length === 0
        return unisci([
          '<section class="page-head">',
          '  <div class="wrap">',
          pieno(p.eyebrow) && '    <p class="eyebrow">' + esc(p.eyebrow) + '</p>',
          '    <h1>' + esc(p.titolo) + '</h1>',
          pieno(p.lead) && '    <p class="lead">' + conTelefono(p.lead) + '</p>',
          '  </div>',
          '</section>',
          sezioni.map(function (s, i) {
            return SEZIONE.libera(i % 2 === 1 ? ' section-alt' : '', s, ANCORE_PAGINA)
          }).join('\n'),
          '<section class="section' + (altFinale ? ' section-alt' : '') + '">',
          '  <div class="wrap cta-strip">',
          rientra(BLOCCHI.ctaFinale(), 4),
          '  </div>',
          '</section>'
        ])
      },

      briciolePagina: function () { return briciole(fileDellaPagina(PAGINA), PAGINA.titolo) },

      orari: function () {
        return c.orari.map(function (o) {
          return '<tr><th>' + esc(o.giorno) + '</th><td>' + esc(o.orario) + '</td></tr>'
        }).join('\n')
      },

      galleria: function () {
        return ['ingresso', 'studio', 'salaAttesa'].map(function (k) {
          return '<img src="' + esc(c.foto[k].file) + '" alt="' + esc(c.foto[k].alt) + '" width="600" height="450" loading="lazy">'
        }).join('\n')
      },

      loghi: function () {
        return c.loghi.map(function (l) {
          return [
            '<div class="logo-card">',
            '  <img src="' + esc(l.file) + '" alt="' + esc(l.alt) + '" loading="lazy">',
            '</div>'
          ].join('\n')
        }).join('\n')
      },

      domande: function () {
        return c.domande.map(function (d) {
          return [
            '<details class="faq">',
            '  <summary>' + esc(d.domanda) + '</summary>',
            '  <p>' + conTelefono(d.risposta) + '</p>',
            '</details>'
          ].join('\n')
        }).join('\n')
      },

      /* Righe dei contatti: telefono, indirizzo, email. */
      contatti: function () {
        return [
          '<a class="contact-row" data-c="tel" href="tel:' + esc(c.studio.telefonoLink) + '">',
          '  <span class="contact-icon" aria-hidden="true">&#9990;</span>',
          '  <span><strong>' + telefono() + '</strong><small>' + esc(c.contatti.sottoTelefono) + '</small></span>',
          '</a>',
          '<a class="contact-row" data-c="mappa" href="' + esc(c.studio.mappaUrl) + '" target="_blank" rel="noopener">',
          '  <span class="contact-icon" aria-hidden="true">&#9906;</span>',
          '  <span><strong>' + esc(indirizzoCompleto()) + '</strong><small>' + esc(c.contatti.sottoMappa) + '</small></span>',
          '</a>',
          '<a class="contact-row" data-c="mail" href="mailto:' + esc(c.studio.email) + '">',
          '  <span class="contact-icon" aria-hidden="true">&#64;</span>',
          '  <span><strong>' + esc(c.studio.email) + '</strong><small>' + esc(c.contatti.sottoEmail) + '</small></span>',
          '</a>'
        ].join('\n')
      },

      /* Il footer e' identico su tutte le pagine: generarlo da qui evita
         di doverlo correggere in quattro punti quando cambia un dato. */
      footer: function () {
        return [
          '<div>',
          '  <strong>' + esc(c.studio.nomeMedico) + '</strong><br>',
          '  ' + esc(c.studio.specialita),
          '</div>',
          '<div>',
          '  ' + esc(c.studio.via) + '<br>',
          '  ' + esc(c.studio.cap) + ' ' + esc(c.studio.citta) + ' (' + esc(c.studio.provincia) + ')<br>',
          '  <a data-c="tel" href="tel:' + esc(c.studio.telefonoLink) + '">' + telefono() + '</a>',
          '</div>',
          '<div class="footer-note">',
          '  <!-- Dati obbligatori per legge sul sito di un medico (pubblicita\'',
          '       sanitaria): vanno tenuti su tutte le pagine, non solo in home. -->',
          '  P. IVA ' + esc(c.studio.partitaIva) + '<br>',
          '  ' + esc(c.studio.ordine) + '<br>',
          '  ' + esc(c.footer.avviso) + '<br>',
          '  &copy; <span id="year">' + new Date().getFullYear() + '</span> ' + esc(c.studio.nomeMedico) + ' &middot;',
          '  <a href="privacy.html">Privacy</a>',
          '</div>'
        ].join('\n')
      },

      /* Striscia finale "Prenotare e' una telefonata", in fondo alle
         pagine interne. */
      ctaFinale: function () {
        return [
          '<div>',
          '  <h2>' + esc(c.ctaFinale.titolo) + '</h2>',
          '  <p class="section-intro">' + conTelefono(c.ctaFinale.testo) + '</p>',
          '</div>',
          '<div class="cta-strip-actions">',
          '  <a class="btn" data-c="tel" href="tel:' + esc(c.studio.telefonoLink) + '">Chiama ' + telefono() + '</a>',
          '  <a class="btn btn-ghost" data-c="mappa" href="' + esc(c.studio.mappaUrl) + '" target="_blank" rel="noopener">' + esc(c.ctaFinale.bottoneMappa) + '</a>',
          '</div>'
        ].join('\n')
      },

      /* Stessa striscia, ma nella privacy il secondo bottone torna alla
         home invece di aprire la mappa. */
      ctaFinalePrivacy: function () {
        return [
          '<div>',
          '  <h2>' + esc(c.ctaFinale.titolo) + '</h2>',
          '  <p class="section-intro">' + conTelefono(c.ctaFinale.testo) + '</p>',
          '</div>',
          '<div class="cta-strip-actions">',
          '  <a class="btn" data-c="tel" href="tel:' + esc(c.studio.telefonoLink) + '">Chiama ' + telefono() + '</a>',
          '  <a class="btn btn-ghost" href="index.html">Torna alla home</a>',
          '</div>'
        ].join('\n')
      },

      /* Titolare del trattamento, nella privacy: e' un dato di legge e
         deve restare identico a quello del footer. */
      titolarePrivacy: function () {
        return [
          '<p>',
          '  ' + esc(c.studio.nomeMedico) + ', ' + esc(indirizzoCompleto()) + '.<br>',
          '  Telefono <a data-c="tel" href="tel:' + esc(c.studio.telefonoLink) + '">' + telefono() + '</a>.',
          '</p>',
          '<p>Email: <a data-c="mail" href="mailto:' + esc(c.studio.email) + '">' + esc(c.studio.email) + '</a></p>'
        ].join('\n')
      },

      /* Tutti i bottoni "Chiama 351...": il numero visibile sta nel
         testo, non solo nel link, quindi va riscritto anche quello. */
      bottoneChiama: function () {
        return '<a class="btn" data-c="tel" href="tel:' + esc(c.studio.telefonoLink) + '">Chiama ' + telefono() + '</a>'
      },

      bottoneChiamaPiccolo: function () {
        return '<a class="btn btn-sm" data-c="tel" href="tel:' + esc(c.studio.telefonoLink) + '">Prenota</a>'
      },

      bottoneChiamaFisso: function () {
        return '<a class="call-fab" data-c="tel" href="tel:' + esc(c.studio.telefonoLink) + '">Chiama ' + telefono() + '</a>'
      },

      bottoneOrari: function () {
        return '<a class="btn btn-block" data-c="tel" href="tel:' + esc(c.studio.telefonoLink) + '">' + esc(c.contatti.bottoneOrari) + '</a>'
      },

      /* Intestazione del sito: marchio, uguale su tutte le pagine. */
      marchio: function () {
        return [
          '<span class="brand-mark">' + esc(c.studio.iniziale) + '</span>',
          '<span class="brand-text">',
          '  <strong>' + esc(c.studio.nomeMedico) + '</strong>',
          '  <small>' + esc(c.studio.specialita) + '</small>',
          '</span>'
        ].join('\n')
      },

      /* Dati strutturati della home: e' il modo in cui si dice a Google
         "questo studio esiste, sta qui, fa queste cose, apre a
         quest'ora", in una forma che legge senza dedurla dal testo. */
      datiStrutturatiHome: function () {
        var dati = {
          '@context': 'https://schema.org',
          '@type': 'Physician',
          // Un indirizzo fisso per lo studio: cosi' le altre pagine possono
          // puntare a questa stessa scheda invece di ridescriverla.
          '@id': c.studio.sito.replace(/\/$/, '') + '/#studio',
          name: c.studio.nomeMedico + ' — Dermatologa',
          medicalSpecialty: 'Dermatology',
          telephone: c.studio.telefonoLink,
          email: c.studio.email,
          address: {
            '@type': 'PostalAddress',
            streetAddress: c.studio.viaDatiStrutturati,
            addressLocality: c.studio.citta,
            addressRegion: c.studio.provincia,
            postalCode: c.studio.cap,
            addressCountry: 'IT'
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: c.studio.latitudine,
            longitude: c.studio.longitudine
          },
          image: c.studio.sito.replace(/\/$/, '') + '/' + c.foto.dottoressa.file,
          areaServed: [
            { '@type': 'City', name: c.studio.citta },
            { '@type': 'AdministrativeArea', name: 'Provincia del Verbano-Cusio-Ossola' }
          ],
          availableService: c.prestazioni.map(function (p) {
            return { '@type': 'MedicalProcedure', name: p.nome, description: p.testo }
          }),
          hasMap: c.studio.mappaUrl,
          url: c.studio.sito,
          // Gli altri posti dove la stessa attivita' e' elencata (scheda
          // Google, albo, directory mediche). Servono a Google per capire
          // che parlano tutti dello stesso studio: si aggiungono in
          // contenuti.json, campo studio.profili.
          sameAs: [c.studio.mappaUrl].concat(c.studio.profili || []),
          // Solo i giorni con un orario: "chiuso" non si scrive, si omette.
          openingHours: c.orari.filter(function (o) {
            return /\d/.test(o.orario)
          }).map(function (o) {
            return o.codice + ' ' + o.orario.replace(/\s*[–—-]\s*/, '-').replace(/\s/g, '')
          })
        }
        return '<script type="application/ld+json">\n' + JSON.stringify(dati, null, 2) + '\n</' + 'script>'
      },

      /* Domande frequenti in forma leggibile da Google: puo' farle
         comparire direttamente nei risultati di ricerca. */
      datiStrutturatiDomande: function () {
        var dati = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: c.domande.map(function (d) {
            return {
              '@type': 'Question',
              name: d.domanda,
              acceptedAnswer: {
                '@type': 'Answer',
                // Nei dati strutturati il segnaposto diventa il numero scritto.
                text: d.risposta.replace(/\{telefono\}/g, c.studio.telefonoVisibile)
              }
            }
          })
        }
        return '<script type="application/ld+json">\n' + JSON.stringify(dati, null, 2) + '\n</' + 'script>'
      },

      /* Briciole di pane: dicono a Google che la pagina sta sotto la home.
         Nei risultati di ricerca il percorso prende il posto dell'indirizzo
         nudo, e aiuta a far indicizzare anche le pagine interne. */
      briciolePrestazioni: function () { return briciole('prestazioni.html', c.paginaPrestazioni.titolo) },
      bricioleDomande: function () { return briciole('domande.html', c.paginaDomande.titolo) },
      briciolePrivacy: function () { return briciole('privacy.html', 'Privacy') }
    }

    function briciole(file, titolo) {
      var base = c.studio.sito.replace(/\/$/, '')
      var dati = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: base + '/' },
          { '@type': 'ListItem', position: 2, name: titolo, item: base + '/' + file }
        ]
      }
      return '<script type="application/ld+json">\n' + JSON.stringify(dati, null, 2) + '\n</' + 'script>'
    }

    /* I blocchi contengono data-c, quindi vanno scritti per primi. */
    function generaPagina(html) {
      var fuori = scriviBlocchi(html)
      fuori = scriviTesti(fuori)
      fuori = scriviTestiTag(fuori)
      fuori = scriviAttributi(fuori)
      return fuori
    }

    return { generaPagina: generaPagina, esc: esc }
  }

  /* Controlli che valgono sia prima di scrivere i file sia prima di
     pubblicare dal pannello: meglio accorgersene di qua. */
  function controlla(c) {
    completa(c)
    var problemi = []
    if (!pieno(c.home && c.home.titolo)) {
      problemi.push('Manca la frase grande della prima schermata: è il titolo della home e non si può togliere.')
    }
    if (!Array.isArray(c.prestazioni) || !c.prestazioni.length) {
      problemi.push('Non c’è nessuna prestazione.')
    }
    (c.prestazioni || []).forEach(function (p, i) {
      if (!p.nome || !p.testo) problemi.push('La prestazione n. ' + (i + 1) + ' non ha nome o descrizione.')
    })
    if (!c.studio.telefonoLink || c.studio.telefonoLink.charAt(0) !== '+') {
      problemi.push('Il numero di telefono non è valido.')
    }
    if (!Array.isArray(c.orari) || c.orari.length !== 7) {
      problemi.push('Servono sette righe di orario, una per giorno.')
    }
    (c.domande || []).forEach(function (d, i) {
      if (!d.domanda || !d.risposta) problemi.push('La domanda n. ' + (i + 1) + ' non ha testo o risposta.')
    })

    /* Gli indirizzi finiscono dentro href e nei dati per Google. Solo
       https://: un link scritto male (o un "javascript:" incollato per
       sbaglio) non deve arrivare in pagina. */
    function eIndirizzoWeb(u) { return /^https:\/\/[^\s"'<>]+$/.test(String(u || '')) }
    if (!eIndirizzoWeb(c.studio.sito)) problemi.push('L’indirizzo del sito deve iniziare con https://')
    if (!eIndirizzoWeb(c.studio.mappaUrl)) problemi.push('Il link a Google Maps deve iniziare con https://')
    ;(c.studio.profili || []).forEach(function (u, i) {
      if (!eIndirizzoWeb(u)) problemi.push('Il profilo n. ' + (i + 1) + ' (studio.profili) deve iniziare con https://')
    })
    if (!/^[^\s@"'<>]+@[^\s@"'<>]+\.[a-z]{2,}$/i.test(String(c.studio.email || ''))) {
      problemi.push('L’email dello studio non sembra valida.')
    }

    /* Le immagini stanno nel sito, sotto img/. Un logo aggiunto e mai
       caricato lascerebbe in pagina un riquadro con l'icona rotta. */
    function eFileImmagine(f) { return /^img\/[\w./-]+\.(jpe?g|png|webp|svg)$/i.test(String(f || '')) && f.indexOf('..') === -1 }
    Object.keys(c.foto || {}).forEach(function (k) {
      if (!eFileImmagine(c.foto[k].file)) problemi.push('Manca la foto “' + k + '”, oppure il suo nome non va bene.')
    })
    ;(c.loghi || []).forEach(function (l, i) {
      if (!eFileImmagine(l.file)) problemi.push('Il logo n. ' + (i + 1) + ' non ha un’immagine: caricala o togli il logo.')
    })

    /* Una sezione visibile deve avere almeno il titolo (e' la sua
       intestazione, per chi legge e per Google). Per le libere si
       controllano anche foto e bottone. "dove" dice in che pagina sta,
       per i messaggi. */
    function controllaSezione(s, dove) {
      var tipo = TIPI_SEZIONE[s.tipo]
      if (s.visibile === false) return
      var titolo = tipo.titolo(c, s)
      var nome = (s.tipo === 'libera' ? '“' + (pieno(titolo) ? titolo : 'senza titolo') + '”' : '“' + tipo.nome + '”') + dove
      if (!pieno(titolo)) problemi.push('La sezione ' + nome + ' è visibile ma non ha il titolo: scrivilo, oppure nascondi la sezione.')
      if (s.tipo !== 'libera') return
      if (pieno(s.foto.file)) {
        if (!eFileImmagine(s.foto.file)) problemi.push('La foto della sezione ' + nome + ' ha un nome che non va bene.')
        if (!pieno(s.foto.alt)) problemi.push('La foto della sezione ' + nome + ' non ha la descrizione.')
      }
      if (pieno(s.bottone.testo) !== pieno(s.bottone.link)) {
        problemi.push('Il bottone della sezione ' + nome + ' ha il testo ma non dove porta, o viceversa.')
      } else if (pieno(s.bottone.link) && !eLinkBottone(s.bottone.link, c)) {
        problemi.push('Il bottone della sezione ' + nome + ' porta a un indirizzo che non va bene: usa {telefono}, {mappa}, {email}, il nome di una pagina del sito che c’è (es. prestazioni.html) o un indirizzo che inizia con https://')
      }
    }

    var esistenti = {}
    c.sezioniHome.forEach(function (s, i) {
      if (!TIPI_SEZIONE[s.tipo]) { problemi.push('La sezione n. ' + (i + 1) + ' della home è di un tipo sconosciuto: ' + s.tipo + '.'); return }
      if (esistenti[s.id]) problemi.push('Due sezioni della home hanno lo stesso identificativo (' + s.id + ').')
      esistenti[s.id] = true
      controllaSezione(s, '')
    })

    /* Pagine: le libere hanno bisogno di un titolo e di un nome di file
       loro, che non sia gia' di un'altra pagina. */
    var fileUsati = {}
    c.pagine.forEach(function (p, i) {
      if (!PAGINE_DI_SERIE[p.tipo] && p.tipo !== 'libera') { problemi.push('La pagina n. ' + (i + 1) + ' è di un tipo sconosciuto: ' + p.tipo + '.'); return }
      if (esistenti[p.id]) problemi.push('Due elementi del sito hanno lo stesso identificativo (' + p.id + ').')
      esistenti[p.id] = true
      if (p.tipo !== 'libera') return
      var nome = '“' + (pieno(p.titolo) ? p.titolo : 'senza titolo') + '”'
      var file = fileDellaPagina(p)
      if (!/^[a-z0-9][a-z0-9-]*\.html$/.test(file)) problemi.push('Il nome del file della pagina ' + nome + ' non va bene: solo lettere minuscole, numeri e trattini, e “.html” in fondo.')
      if (FILE_RISERVATI.indexOf(file) !== -1) problemi.push('La pagina ' + nome + ' non può chiamarsi ' + file + ': quel nome è già di una pagina del sito.')
      if (fileUsati[file]) problemi.push('Due pagine hanno lo stesso indirizzo (' + file + '): cambia il titolo o il nome del file di una delle due.')
      fileUsati[file] = true
      if (p.visibile === false) return
      if (!pieno(p.titolo)) problemi.push('Una pagina visibile non ha il titolo: scrivilo, oppure nascondi la pagina.')
      p.sezioni.forEach(function (s) { controllaSezione(s, ' (pagina ' + nome + ')') })
    })

    /* Menu in alto: ogni voce deve avere un testo e portare a qualcosa
       che esiste. A una sezione o pagina nascosta si', semplicemente non
       compare. */
    var pagineDiSerie = Object.keys(PAGINE_DI_SERIE).map(function (t) { return PAGINE_DI_SERIE[t].file })
    c.menu.forEach(function (v, i) {
      if (!pieno(v.testo)) problemi.push('La voce n. ' + (i + 1) + ' del menu non ha il testo.')
      if (pagineDiSerie.indexOf(v.dove) === -1 && !esistenti[v.dove]) {
        problemi.push('La voce “' + (v.testo || i + 1) + '” del menu porta a una sezione o una pagina che non esiste più.')
      }
    })
    return problemi
  }

  globale.NucleoGenera = {
    // idPagina solo per le pagine libere, generate da modello-pagina.html.
    generaPagina: function (html, contenuti, idPagina) { return creaMotore(completa(contenuti), idPagina).generaPagina(html) },
    controlla: controlla,
    // Per il pannello e per genera.mjs: riempie i campi nuovi in un
    // contenuti.json vecchio, e sa quali sezioni e quali pagine esistono.
    completa: completa,
    fissaFilePagine: fissaFilePagine,
    fileDellaPagina: fileDellaPagina,
    sceltePagine: sceltePagine,
    paginaOnline: paginaOnline,
    TIPI_SEZIONE: TIPI_SEZIONE,
    PAGINE_DI_SERIE: PAGINE_DI_SERIE
  }

})(typeof globalThis !== 'undefined' ? globalThis : this)
