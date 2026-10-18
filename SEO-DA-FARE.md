# Cosa manca per farsi trovare su Google

Controllo fatto il **21 settembre 2026** sul sito online (`https://dermozanetta.it`)
e su cosa esce cercando il nome della dottoressa. Parte tecnica ricontrollata il
**18 ottobre 2026** (Lighthouse: accessibilità, buone pratiche e SEO a 100 su tutte
le pagine).

**In una riga:** il sito è a posto. Quello che manca sta quasi tutto **fuori dal
sito** — la scheda Google, le schede delle directory, e due vecchi siti ancora in
giro che si rubano il nome.

Il *perché* di ogni cosa è spiegato nel
[README, sezione "Farsi trovare su Google"](README.md#farsi-trovare-su-google-per-dermatologo-verbania).
Qui c'è solo la lista delle cose da fare, in ordine di importanza.

---

## Dove siamo rimasti (aggiornato il 18 ottobre 2026)

**Perché cercando "dermatologo Verbania" il sito non esce ancora, mentre "zanetta"
sì.** Cercando il nome non c'è concorrenza. Cercando la categoria Google ordina per
fiducia accumulata, e il sito è online da poche settimane; inoltre Search Console non
è attivata e le directory riportano dati sbagliati. Per le ricerche locali pesa
soprattutto la **mappa**, cioè la scheda Google con le recensioni. "Dermatologo" e
"dermatologa" per Google sono la stessa parola: non serve cambiare i testi. Tempi
realistici: qualche mese, non giorni.

Si procede nell'ordine dei punti 1 → 4 qui sotto. Stato:

- [x] Scheda Google **rivendicata e verificata** (4,3 stelle, 11 recensioni)
- [x] Sito web, telefono, indirizzo e orari della scheda controllati: presenti. Il
      sito web punta a `https://dermozanetta.it/`
- [x] **Descrizione** e **15 servizi** inseriti nella scheda (il testo è qui sotto)
- [ ] **Foto** sulla scheda: istruzioni date, caricamento da confermare (punto 1)
- [ ] **Recensioni**: passo 2D, da fare
- [ ] **Search Console**: serve l'accesso a IONOS (il DNS è lì). Il record TXT di
      Google si **aggiunge**; il record `v=spf1…` già presente **non si tocca**, serve
      alla posta (punto 3)
- [ ] **Nome della scheda**: oggi "Dr.ssa Roberta Zanetta Dermatologa". La
      specializzazione nel nome è sconsigliata (sta già nella categoria) e può far
      intervenire Google. Non urgente: ogni modifica del nome può far ripartire un
      controllo, quindi si decide dopo il resto
- [ ] **Directory** con dati sbagliati e **richiesta di link** ai centri (punto 4)

Descrizione inserita nella scheda (605 caratteri, il limite è 750; tono informativo,
nessuna formula promozionale):

```
Studio dermatologico a Verbania Intra, in Piazza Castello 27. La Dott.ssa Roberta Zanetta, specialista in Dermatologia e Venereologia, riceve su appuntamento. Visite dermatologiche, mappatura dei nei con dermatoscopia digitale e controllo di singoli nei. Valutazione e gestione di acne, psoriasi, dermatite atopica ed eczemi, orticaria, micosi di pelle e unghie, verruche e condilomi, caduta dei capelli e malattie del cuoio capelluto. Crioterapia, asportazione e biopsia di lesioni cutanee, dermatologia pediatrica. Iscritta all’Ordine dei Medici Chirurghi e Odontoiatri del Verbano-Cusio-Ossola, n. 604.
```

I servizi hanno gli stessi nomi delle prestazioni del sito; prezzo e descrizione del
singolo servizio sono lasciati vuoti (sul sito non ci sono tariffe).

---

## Il sito, lato tecnico: già fatto

Niente da fare qui. Elencato solo perché non venga rifatto due volte.

- [x] Sito online su GitHub Pages, HTTPS attivo, `www` che rimanda al dominio senza `www`
- [x] `title` e descrizione con "dermatologa" e "Verbania" su tutte le pagine
- [x] Dati strutturati `Physician` (indirizzo, coordinate, orari, 15 prestazioni) e `FAQPage`
- [x] `robots.txt` e `sitemap.xml` corretti e raggiungibili
- [x] Briciole di pane (`BreadcrumbList`) sulle pagine interne
- [x] Pagina `404.html` che tiene il visitatore dentro il sito
- [x] Foto della prima schermata caricata per prima (`preload` e `fetchpriority`)
- [x] Titoli con "Dermatologa a Verbania" e "Prestazioni dermatologiche a Verbania" in testa
- [x] Contrasto dei colori sufficiente per tutti i testi (bottoni, occhielli)
- [x] Pannello `admin.html` fuori da Google con `noindex`, non più bloccato in
      `robots.txt` (bloccarlo impediva a Google di leggere il `noindex`)

> Le voci del 21 settembre (briciole di pane, pagina 404, foto caricata per prima)
> erano rimaste solo sul computer: sono andate online il 18 ottobre.

---

## 1. Scheda Google Business Profile — pesa più di tutto il resto

Per "dermatologo Verbania" Google mostra prima la mappa con tre studi, poi i
risultati normali. La mappa la decide la scheda, non il sito.

- [x] Scheda **rivendicata e verificata**: è quella collegata dal sito,
      `cid=15553148866995770811`
- [x] Categoria principale: **Dermatologo**
- [x] Indirizzo e telefono identici a quelli del sito (vedi il riquadro al punto 4).
      Il nome ha una piccola differenza ("Dr.ssa … Dermatologa" contro "Dott.ssa"),
      vedi "Dove siamo rimasti"
- [x] Orari identici a quelli del sito: lun 14:30–19:00, mar 10:00–17:00,
      mer 14:00–18:00, gio 14:30–19:00, ven 10:00–17:00, sabato e domenica chiuso
- [x] Campo "sito web" della scheda verso `https://dermozanetta.it/`.
      Il sito punta già alla scheda: fatti tutti e due i collegamenti, Google capisce
      che sono la stessa attività.
- [x] Descrizione e servizi (vedi sopra)
- [ ] **Foto vere** dello studio caricate sulla scheda, con la categoria giusta:
      ingresso → *Esterno*; sala visite e sala d'attesa → *Interno*; ritratto →
      *Team*. Copertina: la sala visite. **Meglio gli originali del telefono**: le foto
      del sito sono compresse e `salaAttesa` e `studio` stanno sotto i 720 px che Google
      consiglia. Niente pazienti riconoscibili. Da controllare anche la foto grande in
      testa alla scheda (un neo con dermatoscopio): se non è dello studio, va tolta
- [ ] **Chiedere le recensioni ai pazienti soddisfatti.** È il fattore singolo più
      pesante di tutti: oggi sono 11. Il link diretto per lasciarne una si genera dalla
      scheda stessa (pulsante "Chiedi recensioni"). Si chiede con gentilezza, senza
      offrire niente in cambio

---

## 2. I due siti vecchi — vanno chiusi o fatti puntare qui

Cercando "Roberta Zanetta dermatologa Verbania" escono ancora due siti diversi da
questo. Per Google sono tre siti della stessa dottoressa che competono fra loro:
nessuno dei tre vince.

- [ ] **`dermatologazanettaroberta.it`** — il dominio non risponde più (non risolve
      nemmeno il DNS) ma Google lo mostra ancora.
  - Se è ancora intestato alla dottoressa: rinnovarlo e reindirizzarlo (redirect 301)
    su `dermozanetta.it`. Si porta dietro la reputazione accumulata negli anni, ed è
    la cosa migliore che possa succedere a questo sito.
  - Se è scaduto davvero: chiederne la rimozione dall'indice
    (Search Console, menu Rimozioni).
- [ ] **`dermatologa-dott-ssa-roberta-zanetta.jimdosite.com`** — il 18 ottobre
      risponde "pagina inesistente" (404): sembra già spento. Google lo toglie da solo
      in qualche settimana. Ricontrollare fra un mese; se compare ancora, chiederne la
      rimozione da Search Console.

---

## 3. Google Search Console — perché Google se ne accorga in fretta

Non risulta attivata: nelle pagine non c'è nessun tag di verifica e la sitemap non è
mai stata inviata. Senza, Google trova il sito lo stesso, ma può volerci qualche
settimana invece di qualche giorno.

- [ ] [search.google.com/search-console](https://search.google.com/search-console/)
      → aggiungi proprietà → **Dominio** → `dermozanetta.it`
- [ ] Verificare con il record **TXT** che Google fornisce, da aggiungere sul pannello
      di chi gestisce il dominio. **Il dominio è su IONOS** (nameserver `ui-dns`):
      *Domini e SSL → dermozanetta.it → DNS → Aggiungi record → TXT*, nome `@`, valore
      la scritta `google-site-verification=…`. **Non modificare il record TXT `v=spf1…`
      già presente**: serve alla posta dello studio. Usare l'account Google dello
      studio (`dermozanetta@gmail.com`), così la proprietà resta dello studio. Il
      registrante del dominio è `zanettaroberta@yahoo.it`: se l'accesso a IONOS è suo,
      serve il suo aiuto per entrare
- [ ] Menu **Sitemap**: inviare `sitemap.xml`
- [ ] Dopo qualche giorno, nel menu **Pagine**, controllare che tutte e quattro le
      pagine risultino indicizzate

> Se preferisci la verifica con il tag HTML invece del record DNS, il tag va messo in
> tutte e cinque le pagine (`index`, `prestazioni`, `domande`, `privacy`, `404`): in
> quel caso conviene aggiungerlo al generatore, non a mano. Il record DNS è più
> semplice e non si perde a ogni rigenerazione.

---

## 4. Le schede sulle directory dicono cose sbagliate

Esistono già, e nessuna è stata corretta. Finché in rete girano due indirizzi e due
numeri diversi, Google non sa quale sia lo studio vero e tiene la scheda più in basso.

Su ognuna c'è un "sei il proprietario di questa attività?": si rivendica e si corregge.
Noioso, ma si fa una volta sola.

| Scheda | Cosa dice oggi | Cosa deve dire |
|---|---|---|
| [PagineGialle](https://www.paginegialle.it/verbania-vb/medico/zanetta-dr-ssa-roberta-dermatologa) | Via Castello 27, **28900** — tel. **0323 553555** | Piazza Castello 27, 28921 — 351 511 8880 |
| [PagineBianche](https://www.paginebianche.it/verbania/zanetta-dr-ssa-roberta-dermatologa.12702195) | lo stesso | lo stesso |
| [Virgilio Aziende](https://aziende.virgilio.it/medico/verbania-vb/zanetta-dr-ssa-roberta-dermatologa) | lo stesso | lo stesso |
| [Cylex](https://www.cylex-italia.it/verbania/zanetta-dr-ssa-roberta-dermatologa-12965758.html) | lo stesso | lo stesso |
| [ReteImprese](https://www.reteimprese.it/dermatologia-medici-specialisti/verbania/azienda/80709) | lo stesso | lo stesso |
| [Doctolib](https://www.doctolib.it/dermatologo-venereologo/verbania/roberta-zanetta) | "**Sig.ra**" Roberta Zanetta, indirizzo di un altro studio | "Dott.ssa", Piazza Castello 27 |

**Il dato giusto, da copiare uguale dappertutto:**

```
Dott.ssa Roberta Zanetta — Dermatologia e Venereologia
Piazza Castello 27, 28921 Verbania (VB)
351 511 8880
dermozanetta@gmail.com
https://dermozanetta.it
```

Da aggiungere anche dove ancora non c'è:

- [ ] [MioDottore](https://www.miodottore.it)
- [ ] [Dottori.it](https://www.dottori.it)
- [ ] Sito dell'Ordine dei Medici Chirurghi e Odontoiatri del Verbano-Cusio-Ossola
- [ ] [ProMater](https://www.centropromater.it/ambulatorio-polispecialistico/dermatologia/):
      la pagina esiste già, chiedere che il nome della dottoressa colleghi a
      `dermozanetta.it`
- [ ] Lo stesso per gli altri tre centri delle collaborazioni (**ASL VCO**,
      **Biochemical**, **Centro Medico Major**): se citano la dottoressa sul loro
      sito, chiedere un collegamento a `dermozanetta.it`. Sono link locali e
      autorevoli, i più preziosi per un sito nuovo

Man mano che una scheda viene corretta **va aggiunta in `contenuti.json`**, campo
`studio.profili`: finisce nei dati strutturati come `sameAs` e dice a Google che
parlano tutti della stessa attività.

```json
"profili": [
  "https://www.paginegialle.it/verbania-vb/medico/zanetta-dr-ssa-roberta-dermatologa",
  "https://www.miodottore.it/..."
]
```

---

## 5. Domande frequenti: sono solo tre

Le domande sono l'unica parte del sito che può comparire da sola nei risultati di
ricerca (dati strutturati `FAQPage`). Tre sono poche. Si aggiungono dal pannello,
sezione "Domande".

Argomenti che i pazienti chiedono davvero e che oggi il sito non copre:

- [ ] Quanto costa la visita e come si paga
- [ ] Cos'è la mappatura dei nei e come funziona il controllo nel tempo
- [ ] Quanto si aspetta per avere un appuntamento
- [ ] Si visitano i bambini
- [ ] Dove si parcheggia in Piazza Castello
- [ ] Cosa succede se un neo va asportato

Le risposte le sa solo lo studio: vanno scritte, non inventate.

---

## Cosa NON serve

Non serve un blog, non servono parole chiave nascoste nel testo, non serve pagare
pubblicità generica. Per una ricerca locale come "dermatologo Verbania" contano quasi
solo: **scheda Google curata e con recensioni**, **dati identici ovunque**, e un sito
veloce che li conferma — che c'è già.
