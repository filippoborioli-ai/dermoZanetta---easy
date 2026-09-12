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

  function creaMotore(c) {

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

    /* {telefono} dentro un testo diventa il numero, cliccabile. */
    function conTelefono(t) {
      return esc(t).replace(
        /\{telefono\}/g,
        '<a href="tel:' + esc(c.studio.telefonoLink) + '">' + esc(c.studio.telefonoVisibile) + '</a>'
      )
    }

    /* "home.titolo" -> c.home.titolo. Se la chiave non esiste ci si
       ferma: meglio un errore chiaro che un buco nella pagina. */
    function valore(chiave) {
      var v = chiave.split('.').reduce(function (o, k) { return o == null ? o : o[k] }, c)
      if (v === undefined) throw new Error('chiave assente in contenuti.json: ' + chiave)
      return v
    }

    /* Toglie accenti e maiuscole. Stessa normalizzazione della ricerca
       in script.js, cosi' "psoriasi" trova anche "Psoriàsi". */
    function normalizza(t) {
      return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    }

    function indirizzoCompleto() {
      return c.studio.via + ', ' + c.studio.cap + ' ' + c.studio.citta + ' (' + c.studio.provincia + ')'
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
    function scriviBlocchi(html) {
      return html.replace(/([ \t]*)<!--B:([\w.]+)-->[\s\S]*?<!--\/B-->/g, function (_, indent, nome) {
        var disegna = BLOCCHI[nome]
        if (!disegna) throw new Error('blocco sconosciuto: ' + nome)
        var righe = disegna().split('\n').map(function (r) {
          return r ? indent + r : r
        }).join('\n')
        return indent + '<!--B:' + nome + '-->\n' + righe + '\n' + indent + '<!--/B-->'
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
        return c.chiSono.paragrafi.map(function (t) { return '<p>' + conTelefono(t) + '</p>' }).join('\n')
      },

      puntiChiSono: function () {
        return c.chiSono.punti.map(function (t) { return '<li>' + conTelefono(t) + '</li>' }).join('\n')
      },

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
          '  <span><strong>' + esc(c.studio.telefonoVisibile) + '</strong><small>' + esc(c.contatti.sottoTelefono) + '</small></span>',
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
          '  <a data-c="tel" href="tel:' + esc(c.studio.telefonoLink) + '">' + esc(c.studio.telefonoVisibile) + '</a>',
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
          '  <a class="btn" data-c="tel" href="tel:' + esc(c.studio.telefonoLink) + '">Chiama ' + esc(c.studio.telefonoVisibile) + '</a>',
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
          '  <a class="btn" data-c="tel" href="tel:' + esc(c.studio.telefonoLink) + '">Chiama ' + esc(c.studio.telefonoVisibile) + '</a>',
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
          '  Telefono <a data-c="tel" href="tel:' + esc(c.studio.telefonoLink) + '">' + esc(c.studio.telefonoVisibile) + '</a>.',
          '</p>',
          '<p>Email: <a data-c="mail" href="mailto:' + esc(c.studio.email) + '">' + esc(c.studio.email) + '</a></p>'
        ].join('\n')
      },

      /* Tutti i bottoni "Chiama 351...": il numero visibile sta nel
         testo, non solo nel link, quindi va riscritto anche quello. */
      bottoneChiama: function () {
        return '<a class="btn" data-c="tel" href="tel:' + esc(c.studio.telefonoLink) + '">Chiama ' + esc(c.studio.telefonoVisibile) + '</a>'
      },

      bottoneChiamaPiccolo: function () {
        return '<a class="btn btn-sm" data-c="tel" href="tel:' + esc(c.studio.telefonoLink) + '">Prenota</a>'
      },

      bottoneChiamaFisso: function () {
        return '<a class="call-fab" data-c="tel" href="tel:' + esc(c.studio.telefonoLink) + '">Chiama ' + esc(c.studio.telefonoVisibile) + '</a>'
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
          sameAs: [c.studio.mappaUrl],
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
      }
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
    var problemi = []
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
    return problemi
  }

  globale.NucleoGenera = {
    generaPagina: function (html, contenuti) { return creaMotore(contenuti).generaPagina(html) },
    controlla: controlla
  }

})(typeof globalThis !== 'undefined' ? globalThis : this)
