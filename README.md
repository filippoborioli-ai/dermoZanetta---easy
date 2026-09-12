# dermoZanetta---easy

Sito di presentazione dello studio della **Dott.ssa Roberta Zanetta**, dermatologa a
Verbania: il medico, le prestazioni, le foto dello studio, domande frequenti e numero
per le prenotazioni.

Versione "easy" del progetto [dermoZanetta](../dermoZanetta): stessi dati e stessi testi,
ma senza database, prenotazione online e area riservata. Solo HTML + CSS + 20 righe di JS:
si apre facendo doppio clic su `index.html`, si pubblica copiando la cartella.

**Indice** — [File](#file) · [Provare il sito](#provare-il-sito-in-locale) ·
[Cambiare telefono, indirizzo o nome](#cambiare-telefono-indirizzo-o-nome-dello-studio) ·
[Orari](#modificare-gli-orari) · [Foto](#foto) ·
[Prestazioni](#aggiungere-togliere-o-modificare-una-prestazione) ·
[Domande frequenti](#modificare-le-domande-frequenti) ·
[Loghi di collaborazione](#aggiungere-togliere-o-sostituire-un-logo-di-collaborazione) · [Colori](#colori) ·
[Checklist prima di pubblicare](#checklist-prima-di-pubblicare) · [Pubblicare](#pubblicare) ·
[Dominio personalizzato](#dominio-personalizzato) · [Farsi trovare su Google](#farsi-trovare-su-google-per-dermatologo-verbania)

## File

| File | Cosa contiene |
|---|---|
| `index.html` | home: medico, prestazioni in evidenza, studio, collaborazioni, contatti |
| `prestazioni.html` | pagina con l'elenco completo delle prestazioni e la ricerca |
| `domande.html` | pagina con le domande frequenti |
| `privacy.html` | informativa privacy del sito, collegata dal footer |
| `dati.js` | **l'elenco delle prestazioni** — è qui che si aggiunge o si toglie |
| `genera.mjs` | riscrive le schede dentro le pagine leggendo `dati.js` |
| `invia-indexnow.mjs` | segnala le pagine a Bing e affini (non a Google) |
| `style.css` | colori, tipografia, layout |
| `script.js` | menu mobile, anno nel footer, disegno dell'elenco e ricerca |
| `img/` | foto del sito, più `img/loghi/` per i loghi delle collaborazioni |
| `CNAME` | una riga sola: il dominio `dermozanetta.it`. Serve a GitHub Pages |
| `sitemap.xml` | elenco delle pagine per Google. Una voce per pagina |
| `robots.txt` | dice ai motori di ricerca che possono indicizzare tutto |

## Provare il sito in locale

Doppio clic su `index.html` (o `prestazioni.html`): si apre nel browser predefinito,
niente server necessario. Dopo ogni modifica salva il file e ricarica la pagina con
`Ctrl+F5` (ricarica "forzata", ignora la cache — con `F5` normale a volte non si vede
subito il cambiamento).

## Cambiare telefono, indirizzo o nome dello studio

Non c'è un solo punto: il numero di telefono compare **~25 volte** fra `index.html` e
`prestazioni.html` (bottoni "Chiama", link `tel:`, testo nel footer, dati strutturati
per Google). Il modo sicuro per cambiarlo ovunque è **cerca e sostituisci su tutti i
file**, con un editor di testo (es. VS Code, notepad++) o da riga di comando:

- numero da chiamare (formato link): `+393515118880`
- numero mostrato a video: `351 511 8880`
- nome: `Roberta Zanetta` (attenzione: compare sia come `Dott.ssa Roberta Zanetta`
  sia da sola dentro ad altri testi)
- indirizzo: `Piazza Castello 27` / `Piazza Castello, 27` (due formati, uno per il
  testo normale e uno per i dati strutturati JSON-LD), più `28921` e `Verbania`
- link Google Maps: `https://maps.google.com/?cid=15553148866995770811`. Quel numero
  è l'identificativo della scheda Google dello studio: il link porta sempre a quella,
  con recensioni, foto e indicazioni, **anche se un domani l'indirizzo cambia**.
  Prima era una ricerca per testo sull'indirizzo, che bastava un refuso a mandare
  nel posto sbagliato

Dopo aver sostituito, apri le pagine e verifica che i bottoni "Chiama" e i link a
Google Maps puntino ancora al posto giusto.

## Dati già inseriti

Presi dal progetto principale (`assets/js/config.js` e `assets/js/prestazioni.js`):

- Dott.ssa Roberta Zanetta — Dermatologia e Venereologia
- Telefono **351 511 8880** (`tel:+393515118880`)
- Piazza Castello 27, 28921 Verbania (VB) — **Verbania Intra**, non il CAP
  generico 28900: è l'indirizzo della scheda Google, quella che usano i pazienti
- 15 prestazioni con i testi già scritti
- Dati strutturati `schema.org/Physician` in fondo alla pagina (utili per Google)

## Dati obbligatori per legge

Sul sito di un medico la **P. IVA** e il **numero di iscrizione all'Ordine** sono
obbligatori (pubblicità sanitaria, L. 175/1992 e DL 145/2007). Sono inseriti:

- **P. IVA 01367340039** — nel footer di tutte e quattro le pagine;
- **Ordine dei Medici Chirurghi e Odontoiatri del Verbano-Cusio-Ossola, n. 604** —
  nel footer di tutte le pagine e, in forma estesa, nell'elenco della sezione
  "Chi ti visita" della home.

Vanno tenuti su **ogni** pagina, non solo in home: se un domani ne aggiungi una,
copia il blocco `<div class="footer-note">` da una pagina esistente e non toccarlo.

L'**email** `dermozanetta@gmail.com` è nei contatti della home, nei dati
strutturati JSON-LD e nell'informativa privacy come recapito del titolare. Se
un giorno lo studio avrà una casella propria, va cambiata in tre punti: cerca
l'indirizzo con una ricerca su tutta la cartella, non a memoria.

Gli **orari** sono quelli reali (lun 14:30–19, mar 10–17, mer 14–18, gio 14:30–19,
ven 10–17, sabato e domenica chiuso). Per cambiarli vedi qui sotto.

## Modificare gli orari

La tabella è in `index.html`, sezione `<section id="contatti">`, dentro
`<table class="hours">`: una riga per giorno.

```html
<tr><th>Luned&igrave;</th><td>9:00 – 18:00</td></tr>
<tr><th>Marted&igrave;</th><td>chiuso</td></tr>
```

- **giorno chiuso** → scrivi `chiuso` al posto dell'orario;
- **solo mattina o solo pomeriggio** → scrivi un solo intervallo, es. `9:00 – 13:00`;
- **mattina e pomeriggio separati** (con pausa pranzo) → scrivi i due intervalli uniti
  da ` · `, es. `9:00 – 13:00 · 15:00 – 18:00`. È lo stesso separatore già usato nelle
  domande frequenti, quindi lo stile resta coerente.

Esempio "lunedì aperto, martedì solo pomeriggio":

```html
<tr><th>Luned&igrave;</th><td>9:00 – 18:00</td></tr>
<tr><th>Marted&igrave;</th><td>14:00 – 18:00</td></tr>
```

Le righe non si aggiungono o tolgono da sole: se un giorno manca, aggiungi una riga
copiandone una esistente; se un giorno non c'è mai visita, puoi anche cancellare
del tutto la sua riga invece di scrivere "chiuso".

**Attenzione al JSON-LD** — in fondo alla pagina c'è un blocco
`<script type="application/ld+json">` che Google legge per mostrare gli orari nei
risultati di ricerca. Contiene una riga `"openingHours"` scritta in inglese
abbreviato (Mo, Tu, We, Th, Fr, Sa, Su), che oggi rispecchia gli orari veri:
`["Mo 14:30-19:00","Tu 10:00-17:00","We 14:00-18:00","Th 14:30-19:00","Fr 10:00-17:00"]`.
Se cambi la tabella aggiorna anche questa riga, altrimenti Google mostra orari
sbagliati anche se la pagina è corretta.

## Foto

Le foto vere sono già inserite, in JPEG e ottimizzate (poche decine di KB l'una:
è ciò che tiene il sito veloce anche con foto reali):

| File | Dove compare |
|---|---|
| `img/dottoressa.jpg` | ritratto in apertura (hero) |
| `img/ingresso.jpg` | galleria "Lo studio" — ingresso |
| `img/studio.jpg` | galleria "Lo studio" — sala visite |
| `img/salaAttesa.jpg` | galleria "Lo studio" — sala d'attesa |

### Sostituire una foto in futuro

1. Ridimensiona la nuova foto a max ~1600&nbsp;px di lato e comprimila come JPEG,
   qualità 75-85 (va bene [squoosh.app](https://squoosh.app), gratuito, dal browser:
   scegli "MozJPEG" come formato d'uscita). Un file sopra i 150-200&nbsp;KB per una
   foto è quasi sempre segno che la compressione non è stata fatta.
2. Dalle **lo stesso nome** del file che sostituisci (uno della tabella sopra) e
   mettila in `img/`, sovrascrivendo.
3. Se invece cambi anche il nome del file, apri `index.html` e aggiorna il `src`
   di quell'immagine — i punti esatti sono segnati dai commenti `<!-- FOTO 1 -->`,
   `<!-- FOTO 2 -->` ecc. Aggiorna anche `alt="..."` se la foto mostra qualcosa di
   diverso da prima (es. non più la sala visite ma lo studio dall'esterno).
4. Salva, ricarica la pagina con `Ctrl+F5` (svuota la cache) e controlla che la
   foto appaia.

Non serve toccare `style.css`: le foto si adattano da sole al riquadro (taglio
automatico, senza deformarsi) qualunque sia la proporzione reale dello scatto.
Per il ritratto in apertura il riquadro è verticale (3:4, con la cima ad arco):
una foto già verticale e centrata sul viso rende meglio di una foto molto
orizzontale ritagliata stretta.

## Come finiscono in pagina le prestazioni

Si scrivono in `dati.js` e basta: quello resta l'unico file da modificare. Ma le
schede **non vengono disegnate dal browser**: stanno scritte dentro `index.html` e
`prestazioni.html`, fra i due commenti `PRESTAZIONI:INIZIO` e `PRESTAZIONI:FINE`.

Il motivo e' Google. Quando le disegnava il JavaScript, un motore di ricerca vedeva
una pagina quasi vuota: le parole "acne", "psoriasi", "mappatura dei nei" non erano
nell'HTML, quindi non finivano nell'indice. Erano proprio le ricerche da
intercettare. Ora `prestazioni.html` passa da 1.176 a 3.018 caratteri di testo vero.

**Non modificare a mano quello che sta fra i due marcatori**: viene riscritto.

Dopo aver toccato `dati.js`:

```bash
node genera.mjs
```

Se te ne dimentichi non succede niente di grave: al push ci pensa GitHub da solo
(`.github/workflows/genera.yml` rilancia il generatore e salva le pagine). Lanciarlo
a mano serve solo a vedere subito il risultato in locale.

La casella di ricerca continua a funzionare: non ridisegna piu' l'elenco, nasconde
le schede che non corrispondono. Il testo su cui cerca (nome, descrizione e
`chiavi`) e' nell'attributo `data-cerca` di ogni scheda, scritto dal generatore.

## Aggiungere, togliere o modificare una prestazione

Si tocca **solo `dati.js`**. Non serve aprire l'HTML: le schede compaiono da sole
sia sulla home (nel carosello a scorrimento laterale) sia in `prestazioni.html`
(griglia con la ricerca). Ci sono tutte in tutti e due i posti.

Ogni prestazione è un blocco così:

```js
  {
    nome: 'Psoriasi',
    testo: 'Diagnosi e gestione della psoriasi cutanea, con valutazione delle terapie disponibili.',
    chiavi: 'psoriasi placche squame chiazze rosse gomiti ginocchia cuoio capelluto',
  },
```

- **modificare** → cambia il testo fra apici, lasciando apici e virgola dove sono;
- **aggiungere** → copia un blocco intero da `{` a `},` e incollalo dove vuoi che
  compaia: l'ordine dell'elenco è l'ordine sulla pagina, e in home è anche
  l'ordine in cui si incontrano scorrendo il carosello;
- **togliere** → cancella il blocco da `{` a `},`.

`chiavi` sono le parole con cui i pazienti cercano davvero — chi ha l'acne scrive
"brufoli", non "acne volgare". Non si vedono sulla pagina: servono solo alla casella
di ricerca di `prestazioni.html`. Possono restare vuote.

Se dentro un testo serve un apostrofo, usa quello tipografico `’` oppure scrivilo
come `dell'esame` (con la barra rovesciata).

**Tono dei testi:** volutamente non promozionale, come nel progetto principale. La
pubblicità sanitaria in Italia vieta formule tipo "i migliori risultati" o
"risolviamo" (art. 9 legge 145/2018): scrivi cos'è e a cosa serve, niente di più.

Dopo una modifica, ricarica la pagina nel browser con `Ctrl+F5` (svuota la cache).

## Modificare le domande frequenti

Sono in `domande.html` (pagina a sé, separata dalla home). Ogni domanda è un blocco:

```html
<details class="faq">
  <summary>Quanto dura la visita dermatologica?</summary>
  <p>
    Gli appuntamenti sono fissati a intervalli di quindici minuti...
  </p>
</details>
```

- **modificare** → cambia il testo dentro `<summary>` (la domanda) o dentro `<p>`
  (la risposta);
- **aggiungere** → copia un blocco intero da `<details` a `</details>` e incollalo
  dove vuoi che compaia;
- **togliere** → cancella il blocco.

Si apre e chiude da sola al clic: non serve JavaScript, è una funzione nativa del
browser (tag `<details>`).

## Aggiungere, togliere o sostituire un logo di collaborazione

La sezione "Collabora con" è in `index.html`, sezione `<section id="collaborazioni">`.
A differenza delle prestazioni, qui **non basta l'immagine**: ogni logo è un blocco
HTML da copiare a mano, perché sono pochi e cambiano raramente.

```html
<div class="logo-card">
  <img src="img/loghi/nome-file.png" alt="Nome della struttura">
</div>
```

- **aggiungere** → metti il file del logo in `img/loghi/`, poi copia un blocco
  `<div class="logo-card">...</div>` intero e incollalo nella sezione, cambiando
  `src` e `alt`;
- **togliere** → cancella il blocco `<div class="logo-card">...</div>` intero
  (e se vuoi anche il file immagine in `img/loghi/`, anche se lasciarlo non causa
  danni: un file non referenziato in nessun HTML semplicemente non viene mai caricato);
- **sostituire** → cambia solo `src` (e l'`alt`, se il nome della struttura cambia).

Il logo si adatta da solo al riquadro (altezza massima 58px, larghezza massima
215px, senza deformarsi). Funziona meglio uno sfondo bianco o trasparente: uno
sfondo colorato pieno crea uno stacco netto col resto della fascia.

I loghi presenti oggi sono quattro: ProMater, ASL VCO, Biochemical e Centro Medico Major. **Da tre in su la
fascia scorre lateralmente su telefono**: l'ultimo logo si vede a meta', ed e' voluto
— e' il segnale che ce n'e' dell'altro, lo stesso meccanismo del carosello delle
prestazioni. Su desktop ci stanno comodi. Se un domani ne aggiungi un quarto o un
quinto, non serve toccare niente: la fascia continua a scorrere.

## Colori

Tutti in cima a `style.css`, nel blocco `:root`. Cambiare `--terracotta` cambia bottoni
e dettagli in tutto il sito.

```css
--crema:      #fdf8f3;  /* sfondo pagina */
--sabbia:     #f4e9de;  /* sfondo sezioni alternate */
--terracotta: #c0764e;  /* bottoni, filetti, accenti */
--salvia:     #7f8f7a;  /* eyebrow, pallini elenco */
--bruno:      #3b2e27;  /* testo principale, footer */
```

## Checklist prima di pubblicare

- [x] Telefono, indirizzo e nome corretti ovunque (vedi sezione sopra)
- [x] **P. IVA** e **numero di iscrizione all'Ordine dei Medici** inseriti nel footer
  di tutte le pagine
- [x] Email dello studio nei contatti, nel JSON-LD e nella privacy
- [x] Orari reali nella tabella **e** nel blocco JSON-LD (sono due punti diversi:
  se aggiorni solo uno Google mostra orari sbagliati)
- [ ] **Record DNS inseriti dal registrar** e *Enforce HTTPS* attivo su GitHub
  (vedi "Dominio personalizzato"): è l'ultimo passo che manca
- [x] Foto vere al posto dei segnaposto `.svg` in `img/`
- [ ] Aperto `index.html` e `prestazioni.html` nel browser e cliccato su tutti i
  bottoni "Chiama" e sul link Google Maps, per controllare che portino al posto giusto
- [ ] Provato il sito anche da telefono (o restringendo la finestra del browser):
  il menu si apre, il bottone "Chiama" in basso funziona

## Pubblicare

Sito statico: carica la cartella su un qualsiasi hosting, oppure attiva GitHub Pages
(Settings del repository → Pages → Source: *Deploy from a branch* → branch `main`,
cartella `/ (root)`). Dopo qualche minuto il sito è online all'indirizzo che GitHub
mostra in quella stessa pagina di impostazioni (del tipo
`https://tuoutente.github.io/dermoZanetta---easy/`).

## Dominio personalizzato

Il dominio **`dermozanetta.it`** e' stato registrato l'11 settembre 2026 ed e' gia'
scritto dentro il sito: i tag `<link rel="canonical">` di tutte le pagine, la
`sitemap.xml`, il `robots.txt` e i tag `og:` puntano li'. Il file `CNAME` accanto a
`index.html` contiene la riga `dermozanetta.it`.

Il dominio **senza `www`** e' quello principale: e' la forma usata nei canonical, e
cambiarla ora vorrebbe dire rimettere mano a tutti i file. `www.dermozanetta.it`
viene comunque fatto funzionare dal record CNAME qui sotto, e GitHub lo reindirizza
da solo sul dominio nudo.

### Cosa resta da fare (una volta sola)

**1. DNS — dal pannello del registrar.** Sono cinque record. I nomi esatti dei campi
cambiano da un registrar all'altro, ma il contenuto e' questo:

| Tipo | Nome | Valore |
|---|---|---|
| A | `@` (dominio nudo) | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `filippoborioli-ai.github.io` |

I quattro record A sono gli indirizzi ufficiali di GitHub Pages: servono tutti e
quattro, sono quattro server diversi. Il valore del CNAME finisce con un punto in
alcuni pannelli (`filippoborioli-ai.github.io.`): e' normale, lascia come propone il
pannello.

**2. GitHub.** Settings del repository → Pages → campo *Custom domain*: scrivi
`dermozanetta.it` e salva. Il file `CNAME` c'e' gia', quindi di solito il campo
risulta compilato da solo dopo il primo push.

**3. Aspettare il DNS.** Da qualche minuto a qualche ora. Finche' non e' propagato
GitHub scrive *"Domain's DNS record could not be verified"*: non e' un errore da
correggere, e' solo da aspettare.

**4. Enforce HTTPS.** Nella stessa pagina, quando la spunta diventa cliccabile,
attivala. Il certificato e' gratuito e si rinnova da solo: non c'e' niente da
comprare. Prima di quel momento il sito risponde in `http://` e il browser lo segna
come "non sicuro" — e' una fase di passaggio, non un problema del sito.

### Controllare che sia andato a buon fine

Dal terminale:

```bash
nslookup dermozanetta.it        # deve rispondere i quattro 185.199.x.153
curl -I https://dermozanetta.it # deve rispondere HTTP/2 200
```

Nel browser: `https://dermozanetta.it` mostra la home con il lucchetto chiuso.

### Il rinnovo

Il dominio va rinnovato ogni anno presso il registrar. Se scade, il sito sparisce:
resta raggiungibile solo l'indirizzo `github.io`. Conviene attivare il rinnovo
automatico e controllare che l'email del registrante
(`zanettaroberta@yahoo.it`, diversa da quella di contatto del sito) sia una
casella letta davvero — gli avvisi di scadenza
arrivano li'.

## Privacy

`privacy.html` e' l'informativa del sito, collegata dal footer di tutte le pagine.

Dice quello che oggi e' vero: **nessun cookie, nessun modulo, nessuna statistica**.
Per questo il sito non ha (e non deve avere) il banner dei cookie: non c'e' niente
da far accettare.

> Se un domani si aggiunge **Google Analytics**, una **mappa Google incorporata**
> (`<iframe>`), un **modulo di contatto**, il **pulsante WhatsApp** o i **font di
> Google caricati da internet**, l'informativa diventa falsa e serve anche il banner
> dei cookie. In quel caso `privacy.html` va riscritta: nel file c'e' un commento
> HTML che lo ricorda, proprio sopra il testo.

L'informativa del sito e' cosa diversa da quella firmata in studio, che riguarda i
dati sanitari del paziente: la pagina lo dice fin dalla prima riga.

## Farsi trovare su Google per "dermatologo Verbania"

Per una ricerca locale come questa, Google mostra due cose separate: il **pacchetto
locale** (la mappa con 3 studi in alto) e i **risultati organici** sotto. Per uno
studio medico il pacchetto locale conta molto di più del sito in sé — ma il sito
resta il punto che li lega assieme e li rende credibili.

### 1. Scheda Google Business Profile — la parte che conta di più

Il sito ha già il link a una scheda Google Maps (quella con `cid=...` nella sezione
contatti): significa che una scheda esiste già. Verifica che sia **rivendicata**
(gestita da voi, non solo esistente) su [business.google.com](https://business.google.com/):

- **Nome, indirizzo, telefono devono essere identici, carattere per carattere**, fra
  la scheda Google e il sito (quello che si chiama coerenza "NAP" — Name, Address,
  Phone). Discrepanze anche piccole confondono Google e indeboliscono il
  posizionamento. **È già successo**: il sito diceva "Via Castello 27, 28900" mentre
  la scheda Google dice "Piazza Castello 27, 28921". Ha vinto la scheda Google,
  perché è quella gestita dalla dottoressa e quella che i pazienti seguono per
  arrivare. Se correggi un indirizzo, correggilo in tutti e due i posti lo stesso
  giorno.
- Categoria principale: "Dermatologo".
- Orari identici a quelli sul sito.
- Foto vere dello studio caricate sulla scheda (le stesse che metti nel sito vanno bene).
- Sito web nel campo apposito della scheda → punta a `https://dermozanetta.it`.
  Il sito gia' punta alla scheda (campo `sameAs` nel JSON-LD): fatti i due
  collegamenti, Google capisce che sito e scheda sono la stessa attivita'.
- **Recensioni**: sono probabilmente il fattore singolo più pesante per il pacchetto
  locale. Chiedi ai pazienti soddisfatti di lasciarne una — un link diretto alla
  pagina delle recensioni si genera dalla scheda Google Business stessa.

### 2. Google Search Console — perché Google trovi e legga il sito

Su [search.google.com/search-console](https://search.google.com/search-console/):
aggiungi la proprietà col dominio, verifica la proprietà (un record DNS TXT, o un
tag HTML che Google fornisce), poi invia `sitemap.xml` da lì (menu Sitemap). Senza
questo passo Google trova comunque il sito prima o poi, ma può volerci settimane;
con Search Console è questione di giorni, e puoi vedere per quali ricerche il sito
compare già.

### 3. Cosa c'è già nel sito che aiuta

- `<title>` e `<meta description>` con "dermatologa" e "Verbania" in entrambe le
  pagine — è già fatto, non toccare la struttura, solo i dati quando cambiano.
- Dati strutturati `schema.org/Physician` (il blocco JSON-LD in fondo a `index.html`)
  con indirizzo e coordinate: aiuta Google a capire cos'è la pagina, non solo a
  leggerla come testo.
- `robots.txt` e `sitemap.xml`: già compilati con `dermozanetta.it`. Quando
  aggiungi o togli una pagina, aggiorna `sitemap.xml` di conseguenza e cambia il
  `<lastmod>` delle pagine modificate.
- Sito veloce e senza dipendenze esterne: Google misura la velocità di caricamento
  come fattore di posizionamento, e un sito statico come questo parte già avvantaggiato.

### 4. Citazioni locali (backlink) — da fare una volta, aiutano nel tempo

Registrare lo studio, con **nome indirizzo e telefono identici** al sito, su:

- Directory mediche: [MioDottore](https://www.miodottore.it), [Dottori.it](https://www.dottori.it)
- Directory generiche: PagineGialle, PagineBianche
- Sito dell'Ordine dei Medici Chirurghi e Odontoiatri della provincia (Verbano-Cusio-Ossola)

Ognuno di questi è un segnale in più che lega nome-indirizzo-telefono allo studio,
e alcuni generano visite dirette al sito.

### Cosa NON serve

Non serve un blog, non servono "parole chiave" nascoste nel testo, non serve pagare
per pubblicità display generica. Per una ricerca locale come "dermatologo Verbania"
contano quasi solo: scheda Google curata e con recensioni, dati coerenti ovunque, e
un sito veloce che li conferma. Il sito attuale copre già l'ultimo punto.
