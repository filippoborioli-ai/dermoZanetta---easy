/* =====================================================================
   GENERATORE DELLE PAGINE — riscrive l'HTML leggendo contenuti.json
   =====================================================================

   Cosa fa
       prende tutti i testi da contenuti.json e li riscrive dentro
       index.html, prestazioni.html, domande.html e privacy.html.
       Le pagine restano HTML normale, apribile con doppio clic: qui
       non si generano file nuovi, si aggiornano quelli che ci sono.

   Perche' esiste
       perche' la dottoressa possa cambiare i testi da admin.html senza
       aprire l'HTML, e perche' Google trovi le parole gia' scritte
       nella pagina invece di doverle aspettare dal JavaScript.

   Come si lancia
       node genera.mjs

   Quando
       ogni volta che cambia contenuti.json. Se te ne dimentichi ci
       pensa GitHub: c'e' un'azione che lo rilancia a ogni push
       (.github/workflows/genera.yml).

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
      non si puo' mettere un commento dentro un tag, quindi il tag si
      marca con data-c:
        <a data-c="tel" href="tel:+39...">
        <img data-c="foto.studio" src="..." alt="...">
      La tabella ATTRIBUTI, piu' sotto, dice quali attributi riscrivere
      per ciascuna chiave.

   Dentro i testi si puo' scrivere {telefono}: diventa il numero
   cliccabile. Utile nelle risposte alle domande frequenti.
   ===================================================================== */

import { readFileSync, writeFileSync } from 'node:fs'

const c = JSON.parse(readFileSync('contenuti.json', 'utf8'))

/* ---------------------------------------------------------------------
   Utilita'
   ------------------------------------------------------------------ */

/* Quello che finisce in pagina e' testo, non codice: se qualcuno scrive
   "<" o "&" in un testo deve restare un carattere visibile. */
function esc(t) {
  return String(t ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/* {telefono} dentro un testo diventa il numero, cliccabile. */
function conTelefono(t) {
  return esc(t).replace(
    /\{telefono\}/g,
    `<a href="tel:${esc(c.studio.telefonoLink)}">${esc(c.studio.telefonoVisibile)}</a>`
  )
}

/* "home.titolo" -> c.home.titolo. Se la chiave non esiste il generatore
   si ferma: meglio un errore qui che un buco nella pagina. */
function valore(chiave) {
  const v = chiave.split('.').reduce((o, k) => (o == null ? o : o[k]), c)
  if (v === undefined) throw new Error(`chiave assente in contenuti.json: ${chiave}`)
  return v
}

/* Toglie accenti e maiuscole. Stessa normalizzazione della ricerca in
   script.js, cosi' "psoriasi" trova anche "Psoriàsi". */
function normalizza(t) {
  return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

const indirizzoCompleto = () =>
  `${c.studio.via}, ${c.studio.cap} ${c.studio.citta} (${c.studio.provincia})`

/* ---------------------------------------------------------------------
   1. Testi semplici:  <!--T:chiave-->...<!--/T-->
   ------------------------------------------------------------------ */
function scriviTesti(html) {
  return html.replace(/<!--T:([\w.]+)-->[\s\S]*?<!--\/T-->/g, (_, chiave) =>
    `<!--T:${chiave}-->${esc(valore(chiave))}<!--/T-->`
  )
}

/* ---------------------------------------------------------------------
   1-bis. Testo dentro un tag intero:  <title data-t="chiave">...</title>

   Dentro <title> un commento HTML non e' un commento: il browser lo
   legge come testo e lo mostra nella linguetta. Li' quindi non si usa
   <!--T:...-->, si marca il tag e si riscrive tutto quello che sta in
   mezzo. Vale per qualsiasi tag senza altri tag dentro.
   ------------------------------------------------------------------ */
function scriviTestiTag(html) {
  return html.replace(
    /<([a-zA-Z0-9]+)([^>]*\bdata-t="([\w.]+)"[^>]*)>[\s\S]*?<\/\1>/g,
    (_, tag, attributi, chiave) => `<${tag}${attributi}>${esc(valore(chiave))}</${tag}>`
  )
}

/* ---------------------------------------------------------------------
   2. Blocchi ripetuti:  <!--B:nome-->...<!--/B-->
   L'indentazione viene ripresa dalla riga del segnaposto, cosi' l'HTML
   generato resta leggibile come quello scritto a mano.
   ------------------------------------------------------------------ */
function scriviBlocchi(html) {
  return html.replace(/([ \t]*)<!--B:([\w.]+)-->[\s\S]*?<!--\/B-->/g, (_, indent, nome) => {
    const disegna = BLOCCHI[nome]
    if (!disegna) throw new Error(`blocco sconosciuto: ${nome}`)
    const righe = disegna()
      .split('\n')
      .map(r => (r ? indent + r : r))
      .join('\n')
    return `${indent}<!--B:${nome}-->\n${righe}\n${indent}<!--/B-->`
  })
}

/* ---------------------------------------------------------------------
   3. Attributi:  <tag data-c="chiave" ...>
   ------------------------------------------------------------------ */
const ATTRIBUTI = () => ({
  'tel': { href: `tel:${c.studio.telefonoLink}` },
  'mail': { href: `mailto:${c.studio.email}` },
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
  'seo.sitoNome': { content: `${c.studio.nomeMedico} — Dermatologa` },

  'ricerca.suggerimento': { placeholder: c.paginaPrestazioni.suggerimentoRicerca },
})

function scriviAttributi(html) {
  const tabella = ATTRIBUTI()
  for (const [chiave, attributi] of Object.entries(tabella)) {
    const cercaTag = new RegExp(`<[^>]*\\sdata-c="${chiave.replace(/\./g, '\\.')}"[^>]*>`, 'g')
    html = html.replace(cercaTag, tag => {
      for (const [nome, val] of Object.entries(attributi)) {
        const cercaAttr = new RegExp(`\\s${nome}="[^"]*"`)
        const nuovo = ` ${nome}="${esc(val)}"`
        tag = cercaAttr.test(tag) ? tag.replace(cercaAttr, nuovo) : tag.replace(/\s*\/?>$/, m => nuovo + m)
      }
      return tag
    })
  }
  return html
}

/* ---------------------------------------------------------------------
   I blocchi
   ------------------------------------------------------------------ */
const BLOCCHI = {

  /* Schede delle prestazioni. data-cerca contiene nome, testo e chiavi
     gia' senza accenti: e' il testo su cui lavora la ricerca di
     prestazioni.html. Le chiavi non si vedono in pagina, servono solo
     a far trovare la scheda (chi ha l'acne cerca "brufoli"). */
  prestazioni: () => c.prestazioni.map(p => {
    const cerca = normalizza(`${p.nome} ${p.testo} ${p.chiavi || ''}`).replace(/\s+/g, ' ').trim()
    return [
      `<article class="card" data-cerca="${esc(cerca)}">`,
      `  <h3>${esc(p.nome)}</h3>`,
      `  <p>${esc(p.testo)}</p>`,
      `</article>`,
    ].join('\n')
  }).join('\n'),

  paragrafiChiSono: () => c.chiSono.paragrafi.map(t => `<p>${conTelefono(t)}</p>`).join('\n'),

  puntiChiSono: () => c.chiSono.punti.map(t => `<li>${conTelefono(t)}</li>`).join('\n'),

  orari: () => c.orari
    .map(o => `<tr><th>${esc(o.giorno)}</th><td>${esc(o.orario)}</td></tr>`)
    .join('\n'),

  galleria: () => ['ingresso', 'studio', 'salaAttesa']
    .map(k => `<img src="${esc(c.foto[k].file)}" alt="${esc(c.foto[k].alt)}" width="600" height="450" loading="lazy">`)
    .join('\n'),

  loghi: () => c.loghi.map(l => [
    `<div class="logo-card">`,
    `  <img src="${esc(l.file)}" alt="${esc(l.alt)}" loading="lazy">`,
    `</div>`,
  ].join('\n')).join('\n'),

  domande: () => c.domande.map(d => [
    `<details class="faq">`,
    `  <summary>${esc(d.domanda)}</summary>`,
    `  <p>${conTelefono(d.risposta)}</p>`,
    `</details>`,
  ].join('\n')).join('\n'),

  /* Righe dei contatti: telefono, indirizzo, email. */
  contatti: () => [
    `<a class="contact-row" data-c="tel" href="tel:${esc(c.studio.telefonoLink)}">`,
    `  <span class="contact-icon" aria-hidden="true">&#9990;</span>`,
    `  <span><strong>${esc(c.studio.telefonoVisibile)}</strong><small>${esc(c.contatti.sottoTelefono)}</small></span>`,
    `</a>`,
    `<a class="contact-row" data-c="mappa" href="${esc(c.studio.mappaUrl)}" target="_blank" rel="noopener">`,
    `  <span class="contact-icon" aria-hidden="true">&#9906;</span>`,
    `  <span><strong>${esc(indirizzoCompleto())}</strong><small>${esc(c.contatti.sottoMappa)}</small></span>`,
    `</a>`,
    `<a class="contact-row" data-c="mail" href="mailto:${esc(c.studio.email)}">`,
    `  <span class="contact-icon" aria-hidden="true">&#64;</span>`,
    `  <span><strong>${esc(c.studio.email)}</strong><small>${esc(c.contatti.sottoEmail)}</small></span>`,
    `</a>`,
  ].join('\n'),

  /* Il footer e' identico su tutte le pagine: generarlo da qui evita di
     doverlo correggere in quattro punti quando cambia un dato. */
  footer: () => [
    `<div>`,
    `  <strong>${esc(c.studio.nomeMedico)}</strong><br>`,
    `  ${esc(c.studio.specialita)}`,
    `</div>`,
    `<div>`,
    `  ${esc(c.studio.via)}<br>`,
    `  ${esc(c.studio.cap)} ${esc(c.studio.citta)} (${esc(c.studio.provincia)})<br>`,
    `  <a data-c="tel" href="tel:${esc(c.studio.telefonoLink)}">${esc(c.studio.telefonoVisibile)}</a>`,
    `</div>`,
    `<div class="footer-note">`,
    `  <!-- Dati obbligatori per legge sul sito di un medico (pubblicita'`,
    `       sanitaria): vanno tenuti su tutte le pagine, non solo in home. -->`,
    `  P. IVA ${esc(c.studio.partitaIva)}<br>`,
    `  ${esc(c.studio.ordine)}<br>`,
    `  ${esc(c.footer.avviso)}<br>`,
    `  &copy; <span id="year">${new Date().getFullYear()}</span> ${esc(c.studio.nomeMedico)} &middot;`,
    `  <a href="privacy.html">Privacy</a>`,
    `</div>`,
  ].join('\n'),

  /* Striscia finale "Prenotare e' una telefonata", in fondo alle pagine
     interne. */
  ctaFinale: () => [
    `<div>`,
    `  <h2>${esc(c.ctaFinale.titolo)}</h2>`,
    `  <p class="section-intro">${conTelefono(c.ctaFinale.testo)}</p>`,
    `</div>`,
    `<div class="cta-strip-actions">`,
    `  <a class="btn" data-c="tel" href="tel:${esc(c.studio.telefonoLink)}">Chiama ${esc(c.studio.telefonoVisibile)}</a>`,
    `  <a class="btn btn-ghost" data-c="mappa" href="${esc(c.studio.mappaUrl)}" target="_blank" rel="noopener">${esc(c.ctaFinale.bottoneMappa)}</a>`,
    `</div>`,
  ].join('\n'),

  /* Stessa striscia, ma nella privacy il secondo bottone torna alla home
     invece di aprire la mappa. */
  ctaFinalePrivacy: () => [
    `<div>`,
    `  <h2>${esc(c.ctaFinale.titolo)}</h2>`,
    `  <p class="section-intro">${conTelefono(c.ctaFinale.testo)}</p>`,
    `</div>`,
    `<div class="cta-strip-actions">`,
    `  <a class="btn" data-c="tel" href="tel:${esc(c.studio.telefonoLink)}">Chiama ${esc(c.studio.telefonoVisibile)}</a>`,
    `  <a class="btn btn-ghost" href="index.html">Torna alla home</a>`,
    `</div>`,
  ].join('\n'),

  /* Titolare del trattamento, nella privacy: e' un dato di legge e deve
     restare identico a quello del footer. */
  titolarePrivacy: () => [
    `<p>`,
    `  ${esc(c.studio.nomeMedico)}, ${esc(indirizzoCompleto())}.<br>`,
    `  Telefono <a data-c="tel" href="tel:${esc(c.studio.telefonoLink)}">${esc(c.studio.telefonoVisibile)}</a>.`,
    `</p>`,
    `<p>Email: <a data-c="mail" href="mailto:${esc(c.studio.email)}">${esc(c.studio.email)}</a></p>`,
  ].join('\n'),

  /* Tutti i bottoni "Chiama 351...": il numero visibile sta nel testo,
     non solo nel link, quindi va riscritto anche quello. */
  bottoneChiama: () =>
    `<a class="btn" data-c="tel" href="tel:${esc(c.studio.telefonoLink)}">Chiama ${esc(c.studio.telefonoVisibile)}</a>`,

  bottoneChiamaPiccolo: () =>
    `<a class="btn btn-sm" data-c="tel" href="tel:${esc(c.studio.telefonoLink)}">Prenota</a>`,

  bottoneChiamaFisso: () =>
    `<a class="call-fab" data-c="tel" href="tel:${esc(c.studio.telefonoLink)}">Chiama ${esc(c.studio.telefonoVisibile)}</a>`,

  bottoneOrari: () =>
    `<a class="btn btn-block" data-c="tel" href="tel:${esc(c.studio.telefonoLink)}">${esc(c.contatti.bottoneOrari)}</a>`,

  /* Intestazione del sito: marchio e menu, uguali su tutte le pagine.
     La voce corrente viene marcata con aria-current dal chiamante. */
  marchio: () => [
    `<span class="brand-mark">${esc(c.studio.iniziale)}</span>`,
    `<span class="brand-text">`,
    `  <strong>${esc(c.studio.nomeMedico)}</strong>`,
    `  <small>${esc(c.studio.specialita)}</small>`,
    `</span>`,
  ].join('\n'),

  /* Dati strutturati della home: e' il modo in cui si dice a Google
     "questo studio esiste, sta qui, fa queste cose, apre a quest'ora",
     in una forma che legge senza doverla dedurre dal testo. */
  datiStrutturatiHome: () => {
    const dati = {
      '@context': 'https://schema.org',
      '@type': 'Physician',
      name: `${c.studio.nomeMedico} — Dermatologa`,
      medicalSpecialty: 'Dermatology',
      telephone: c.studio.telefonoLink,
      email: c.studio.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: c.studio.viaDatiStrutturati,
        addressLocality: c.studio.citta,
        addressRegion: c.studio.provincia,
        postalCode: c.studio.cap,
        addressCountry: 'IT',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: c.studio.latitudine,
        longitude: c.studio.longitudine,
      },
      image: c.studio.sito.replace(/\/$/, '') + '/' + c.foto.dottoressa.file,
      areaServed: [
        { '@type': 'City', name: c.studio.citta },
        { '@type': 'AdministrativeArea', name: 'Provincia del Verbano-Cusio-Ossola' },
      ],
      availableService: c.prestazioni.map(p => ({
        '@type': 'MedicalProcedure',
        name: p.nome,
        description: p.testo,
      })),
      hasMap: c.studio.mappaUrl,
      url: c.studio.sito,
      sameAs: [c.studio.mappaUrl],
      // Solo i giorni con un orario: "chiuso" non si scrive, si omette.
      openingHours: c.orari
        .filter(o => /\d/.test(o.orario))
        .map(o => `${o.codice} ${o.orario.replace(/\s*[–—-]\s*/, '-').replace(/\s/g, '')}`),
    }
    return `<script type="application/ld+json">\n${JSON.stringify(dati, null, 2)}\n</script>`
  },

  /* Domande frequenti in forma leggibile da Google: puo' farle comparire
     direttamente nei risultati di ricerca. */
  datiStrutturatiDomande: () => {
    const dati = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: c.domande.map(d => ({
        '@type': 'Question',
        name: d.domanda,
        acceptedAnswer: {
          '@type': 'Answer',
          // Nei dati strutturati il segnaposto diventa il numero scritto.
          text: d.risposta.replace(/\{telefono\}/g, c.studio.telefonoVisibile),
        },
      })),
    }
    return `<script type="application/ld+json">\n${JSON.stringify(dati, null, 2)}\n</script>`
  },
}

/* ---------------------------------------------------------------------
   Esecuzione
   ------------------------------------------------------------------ */
function controlli() {
  if (!Array.isArray(c.prestazioni) || !c.prestazioni.length) {
    throw new Error('contenuti.json: nessuna prestazione')
  }
  for (const p of c.prestazioni) {
    if (!p.nome || !p.testo) throw new Error(`prestazione senza nome o testo: ${JSON.stringify(p)}`)
  }
  if (!c.studio.telefonoLink.startsWith('+')) {
    throw new Error('contenuti.json: telefonoLink deve iniziare con +39')
  }
  if (c.orari.length !== 7) throw new Error('contenuti.json: servono sette righe di orario')
}

function aggiorna(file) {
  const prima = readFileSync(file, 'utf8')
  let dopo = scriviBlocchi(prima)      // prima i blocchi: dentro ci sono data-c
  dopo = scriviTesti(dopo)
  dopo = scriviTestiTag(dopo)
  dopo = scriviAttributi(dopo)
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

controlli()
const cambiate = []
for (const file of ['index.html', 'prestazioni.html', 'domande.html', 'privacy.html']) {
  if (aggiorna(file)) cambiate.push(file)
}
aggiornaSitemap(cambiate)

/* Un JSON-LD rotto Google lo scarta in silenzio: meglio accorgersene qui. */
for (const file of ['index.html', 'domande.html']) {
  const html = readFileSync(file, 'utf8')
  for (const pezzo of html.split('<script type="application/ld+json">').slice(1)) {
    JSON.parse(pezzo.split('</script>')[0])
  }
}
console.log(`Fatto: ${c.prestazioni.length} prestazioni, ${c.domande.length} domande, dati strutturati validi.`)
