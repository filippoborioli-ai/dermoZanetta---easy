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

- [ ] Entrare su [business.google.com](https://business.google.com/) e verificare che
      la scheda sia **rivendicata** (gestita dalla dottoressa, non solo esistente).
      La scheda esiste già: è quella collegata dal sito, `cid=15553148866995770811`.
- [ ] Categoria principale: **Dermatologo**
- [ ] Nome, indirizzo e telefono **identici carattere per carattere** a quelli del sito
      (vedi il riquadro al punto 4)
- [ ] Orari identici a quelli del sito: lun 14:30–19:00, mar 10:00–17:00,
      mer 14:00–18:00, gio 14:30–19:00, ven 10:00–17:00, sabato e domenica chiuso
- [ ] Campo "sito web" della scheda verso `https://dermozanetta.it`.
      Il sito punta già alla scheda: fatti tutti e due i collegamenti, Google capisce
      che sono la stessa attività.
- [ ] Foto vere dello studio caricate sulla scheda (vanno bene le stesse del sito)
- [ ] **Chiedere le recensioni ai pazienti soddisfatti.** È il fattore singolo più
      pesante di tutti. Il link diretto per lasciarne una si genera dalla scheda stessa.

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
- [ ] **`dermatologa-dott-ssa-roberta-zanetta.jimdosite.com`** — sito Jimdo ancora
      online. Spegnerlo, oppure lasciare una pagina sola che rimanda qui.

---

## 3. Google Search Console — perché Google se ne accorga in fretta

Non risulta attivata: nelle pagine non c'è nessun tag di verifica e la sitemap non è
mai stata inviata. Senza, Google trova il sito lo stesso, ma può volerci qualche
settimana invece di qualche giorno.

- [ ] [search.google.com/search-console](https://search.google.com/search-console/)
      → aggiungi proprietà → **Dominio** → `dermozanetta.it`
- [ ] Verificare con il record **TXT** che Google fornisce, da aggiungere sul pannello
      di chi gestisce il dominio
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
