# dermoZanetta---easy

Sito di presentazione dello studio della **Dott.ssa Roberta Zanetta**, dermatologa a
Verbania: il medico, le prestazioni, le foto dello studio, domande frequenti e numero
per le prenotazioni.

Versione "easy" del progetto [dermoZanetta](../dermoZanetta): stessi dati e stessi
testi, ma senza database, prenotazione online e area riservata. HTML + CSS + poco
JavaScript, nessuna libreria, nessun server.

---

## In due righe: chi cambia cosa

| Vuoi cambiare… | Si fa da… |
|---|---|
| testi, orari, foto, prestazioni, domande, dati dello studio | **[il pannello](#il-pannello-di-modifica)**, `admin.html` — nessun codice |
| colori, tipografia, layout, pagine nuove | il codice: `style.css` e i file `.html` |

La dottoressa usa solo la prima riga. Chi legge questo README, di solito, la seconda.

**Indice** — [Come è fatto](#come-è-fatto-il-progetto) · [File](#i-file) ·
[Il pannello](#il-pannello-di-modifica) · [Anteprima](#lanteprima) · [Cosa non si cambia dal pannello](#cosa-il-pannello-non-cambia) ·
[Provarlo in locale](#provare-il-sito-in-locale) · [Aggiungere un campo modificabile](#aggiungere-un-campo-modificabile) ·
[Dati obbligatori per legge](#dati-obbligatori-per-legge) · [Colori](#colori) ·
[Se qualcosa va storto](#se-qualcosa-va-storto) · [Pubblicare](#pubblicare) ·
[Dominio](#dominio-personalizzato) · [Privacy](#privacy) ·
[Farsi trovare su Google](#farsi-trovare-su-google-per-dermatologo-verbania)

---

## Come è fatto il progetto

C'è una sola idea da tenere a mente, il resto discende da quella:

> **Tutti i testi del sito stanno in un unico file, `contenuti.json`.
> Le pagine HTML non si scrivono a mano: le riscrive `genera.mjs` leggendo quel file.**

Il giro completo:

```
  admin.html            la dottoressa modifica un modulo e vede
       │                 l'anteprima aggiornarsi mentre scrive
       ▼
  contenuti.json        il file dei testi, salvato su GitHub
       │
       ▼  (azione automatica di GitHub, .github/workflows/genera.yml)
  node genera.mjs       riscrive le pagine e la data nella sitemap
       │
       ▼
  index.html  prestazioni.html  domande.html  privacy.html
       │
       ▼
  GitHub Pages          il sito online, aggiornato in un paio di minuti
```

### Una regola sola, usata da due parti

La trasformazione "testi → pagina" sta tutta in **`genera-nucleo.js`**: una
funzione, `generaPagina(html, contenuti)`, che non legge e non scrive file.

La usano in due:

- `genera.mjs`, che riscrive i file veri quando si pubblica;
- `admin.html`, che disegna l'anteprima mentre si scrive.

È il motivo per cui l'anteprima **non è una simulazione**: è la pagina vera,
costruita con lo stesso codice che genererà il sito. Se fossero due copie, prima
o poi l'anteprima mostrerebbe una cosa e il sito ne pubblicherebbe un'altra.

### Perché non è più semplice far disegnare le pagine al JavaScript

Perché Google. Se le prestazioni le disegnasse il browser, un motore di ricerca
vedrebbe una pagina quasi vuota: le parole "acne", "psoriasi", "mappatura dei nei"
non sarebbero nell'HTML, e sono esattamente le ricerche da intercettare. Scrivendole
nel file, il testo c'è già quando Google arriva. È lo stesso motivo per cui il
generatore scrive anche i dati strutturati (JSON-LD) e non li lascia al browser.

### I segnaposto nell'HTML

Aprendo `index.html` si trovano dei commenti che sembrano strani. Sono i punti in
cui il generatore scrive. Sono quattro tipi:

| Nella pagina si legge | Vuol dire |
|---|---|
| `<!--T:home.titolo-->…<!--/T-->` | qui va il **testo** che in `contenuti.json` sta alla voce `home.titolo` |
| `<!--B:orari-->…<!--/B-->` | qui va un **blocco** disegnato da una funzione di `genera-nucleo.js` (le righe degli orari, le schede, i loghi…) |
| `<title data-t="seo.home.titolo">` | il testo di un **tag intero**. Serve dove un commento non funziona: dentro `<title>` il browser lo mostrerebbe come testo |
| `<img data-c="foto.studio" …>` | dentro un tag non si può mettere un commento: `data-c` dice **quali attributi riscrivere** (`src`, `alt`, `href`, `content`, `placeholder`) |

Tutto ciò che sta fra `<!--B:` e `<!--/B-->` **viene buttato e riscritto a ogni
generazione**: modificarlo a mano è tempo perso.

---

## I file

| File | Cosa contiene |
|---|---|
| `contenuti.json` | **tutti i testi del sito.** È la sorgente di tutto |
| `admin.html` · `admin.js` · `admin.css` | il pannello di modifica: modulo, anteprima, accesso, pubblicazione |
| `genera-nucleo.js` | **la regola** con cui i testi diventano pagina. Usato sia da `genera.mjs` sia dall'anteprima |
| `genera.mjs` | apre i file, applica la regola, li salva, aggiorna la sitemap |
| `cambia-password.mjs` | cambia la password del pannello |
| `index.html` | home: medico, prestazioni in evidenza, studio, collaborazioni, contatti |
| `prestazioni.html` | elenco completo delle prestazioni, con la ricerca |
| `domande.html` | domande frequenti |
| `privacy.html` | informativa privacy del sito, collegata dal footer |
| `style.css` | colori, tipografia, layout del sito |
| `script.js` | menu mobile, barra del carosello, ricerca delle prestazioni |
| `img/` | foto del sito, più `img/loghi/` per i loghi delle collaborazioni |
| `sitemap.xml` · `robots.txt` | elenco delle pagine per i motori di ricerca |
| `invia-indexnow.mjs` | segnala le pagine a Bing e affini (non a Google) |
| `CNAME` | una riga sola: il dominio `dermozanetta.it`. Serve a GitHub Pages |
| `CREDENZIALI.md` | email e password del pannello. **Non è su GitHub**, sta in `.gitignore` |
| `.github/workflows/genera.yml` | rilancia `genera.mjs` a ogni modifica dei contenuti |

Il vecchio `dati.js` non c'è più: le prestazioni sono dentro `contenuti.json`
insieme a tutto il resto.

---

## Il pannello di modifica

### Come si entra

**https://dermozanetta.it/admin.html** — email e password stanno in `CREDENZIALI.md`.

Va aperta **dal sito vero**, non con doppio clic sul file: aperta da disco il
browser non le lascia leggere i contenuti (è una regola di sicurezza dei browser,
non un difetto della pagina).

Non è collegata da nessun menu e `robots.txt` la tiene fuori da Google: la si
raggiunge solo scrivendo l'indirizzo.

### Che cosa si può cambiare

| Sezione del pannello | Comanda |
|---|---|
| **Studio e contatti** | nome, telefono, email, indirizzo, P. IVA, Ordine, link a Google Maps. Cambiati qui, cambiano **ovunque**: footer di tutte le pagine, bottoni "Chiama", privacy, dati per Google |
| **Prima schermata** | la frase grande della home, quella sotto, i bottoni |
| **Il medico** | la sezione "Chi ti visita": paragrafi ed elenco con la spunta |
| **Prestazioni** | aggiungi, togli, riordina, riscrivi. Compaiono da sole sia nel carosello della home sia nella pagina Prestazioni |
| **Foto** | le quattro foto del sito. Si scelgono dal telefono o dal computer: vengono rimpicciolite e compresse dal pannello, non serve preparare niente |
| **Collaborazioni** | i loghi delle strutture: aggiungi, sostituisci, togli |
| **Orari** | i sette giorni. "chiuso" oppure un orario |
| **Sezione contatti** | le scritte intorno a telefono, indirizzo ed email |
| **Domande frequenti** | aggiungi, togli, riordina, riscrivi |
| **Google** | titolo e descrizione che compaiono nei risultati di ricerca, pagina per pagina |
| **Collegamento al sito** | si usa una volta sola, all'inizio (vedi sotto) |

Due scorciatoie utili dentro i testi:

- scrivendo **`{telefono}`** compare il numero dello studio, cliccabile. Funziona
  nelle risposte alle domande e nei testi lunghi;
- le **parole per la ricerca** di una prestazione non si vedono in pagina: servono
  solo alla casella di ricerca. Chi ha l'acne cerca "brufoli", non "acne volgare".

### L'anteprima

Accanto al modulo c'è il sito, che si aggiorna mentre si scrive. Non è un'idea
approssimativa di come verrà: è la pagina vera, ricostruita a ogni pausa di
digitazione con lo stesso `genera-nucleo.js` che genererà il sito al momento di
pubblicare.

- cambiando sezione l'anteprima **va da sola** al punto giusto della pagina
  (gli orari → i contatti, il medico → "Chi ti visita", e così via);
- mentre si scrive **resta ferma dov'era**, così si vede l'effetto senza
  rincorrerlo;
- **Computer / Telefono** mostra la stessa pagina alla larghezza di uno schermo di
  telefono: vale la pena guardarci, è da lì che arriva la maggior parte dei pazienti;
- una **foto appena scelta** si vede subito nell'anteprima, anche se non è ancora
  stata pubblicata;
- in alto a destra c'è scritto se quello che si vede è già online o no;
- il bottone **Nascondi anteprima** la chiude, se serve spazio. Su schermi stretti
  parte chiusa e si apre a tutto schermo.

I link dentro l'anteprima non funzionano, apposta: servirebbero a uscire dal
pannello. Per girare il sito vero c'è il bottone "Vedi il sito".

### Come funziona la pubblicazione

Si preme **Salva e pubblica**. Il pannello manda `contenuti.json` (e le eventuali
foto nuove) a GitHub; lì un'azione automatica rilancia `genera.mjs`, che riscrive
le pagine; GitHub Pages le rimette online. Passano **un paio di minuti**, poi basta
ricaricare il sito con `Ctrl+F5`.

Se si chiude il pannello senza pubblicare, le modifiche **non si perdono**: restano
sul dispositivo e al rientro il pannello chiede se riprenderle.

### Chi deve aprire GitHub: nessuno, dopo il primo giorno

Questo è il punto che si fraintende più facilmente. **Chi scrive i testi non apre
mai GitHub.** Il suo giro è tutto qui:

> apre `dermozanetta.it/admin.html` → password → modifica → **Salva e pubblica**

Il collegamento a GitHub lo fa **chi gestisce il sito**, una volta sola, e da quel
momento sparisce dalla vista.

### La serratura: password e codice di collegamento

Sono due cose diverse, ed è importante capire perché.

- La **password** apre il pannello. È una comodità: `admin.html` è una pagina
  pubblica come le altre, quindi la password può essere provata da chiunque abbia
  tempo. In `admin.js` non c'è la password, c'è la sua impronta.
- Il **codice di collegamento** (un token GitHub) è la serratura vera. Senza, il
  pannello mostra il modulo e può scaricare un file — **non può toccare il sito**.

Un sito statico non ha un server dove nascondere un segreto: è per questo che la
vera barriera è il token, e non la password. Per togliere l'accesso a qualcuno si
revoca il token su GitHub, non si cambia la password.

Il token va incollato **dal dispositivo che userà chi scrive i testi**, perché è
lì che resta cifrato. In pratica lo si crea sul proprio account e lo si incolla
una volta sul computer di chi userà il pannello. Se userà anche il telefono, si
ripete lì: stesso codice, una volta per dispositivo.

I passi stanno dentro il pannello (sezione "Collegamento al sito") e in
`CREDENZIALI.md`. In breve: GitHub → Settings → Developer settings → Personal
access tokens → Fine-grained → solo questo deposito → **Contents: Read and write**.

Il token **scade**: quando succede, il pannello lo dice, le modifiche non si
perdono e si rifà il collegamento con un token nuovo. Vale la pena segnarsi la
data di scadenza in `CREDENZIALI.md`.

### Cambiare la password

```bash
node cambia-password.mjs "la-nuova-password"
node cambia-password.mjs "la-nuova-password" nuova@email.it   # anche l'email
```

Poi push, e aggiorna `CREDENZIALI.md`. La password vecchia non serve: non è
salvata da nessuna parte e non è recuperabile.

### Se il pannello non può pubblicare: la via di scorta

Dalla sezione "Collegamento al sito" si può **scaricare il file delle modifiche**
(`contenuti.json`) e mandarlo a chi gestisce il sito, che lo carica su GitHub
trascinandolo nella cartella. Il risultato è identico. Serve quando il token è
scaduto e non c'è tempo di rifarlo: le modifiche non vanno perse comunque, perché
restano salvate sul dispositivo fino alla prossima pubblicazione.

---

## Cosa il pannello non cambia

Di proposito. Sono cose che si toccano di rado e che, sbagliate, rompono il sito
o lo mettono fuori legge:

- **colori, tipografia, layout** → `style.css`;
- **struttura delle pagine** (aggiungere una sezione, spostarne una) → i file `.html`;
- **testo dell'informativa privacy** → `privacy.html`. Dal pannello si aggiornano
  solo i dati del titolare (nome, indirizzo, telefono, email), che devono restare
  identici a quelli del footer;
- **pagine nuove** → si crea il file, si aggiunge la voce in `sitemap.xml` e il
  link nel menu di tutte le pagine;
- **P. IVA e numero d'Ordine** si cambiano dal pannello, ma **non si tolgono**: sono
  obbligatori per legge (vedi sotto).

---

## Provare il sito in locale

Le pagine si aprono con doppio clic su `index.html`: sono HTML normale, non serve
un server.

Il **pannello**, invece, un server lo richiede, perché deve leggere `contenuti.json`:

```bash
node genera.mjs        # dopo aver modificato contenuti.json a mano
npx serve .            # oppure: python -m http.server 8000
```

poi `http://localhost:3000/admin.html` (o la porta che stampa il comando).

Dopo ogni modifica ricarica con `Ctrl+F5` (ricarica forzata: con `F5` normale a
volte si vede ancora la versione vecchia).

---

## Aggiungere un campo modificabile

Serve quando si vuole rendere modificabile dal pannello un testo che oggi è
scritto nell'HTML. Tre passi, sempre gli stessi:

1. **`contenuti.json`** — aggiungi la voce, per esempio `"home": { "nuovaFrase": "..." }`.
2. **HTML** — metti il segnaposto dove deve comparire:
   `<p><!--T:home.nuovaFrase-->testo di partenza<!--/T--></p>`.
   Se il testo sta dentro un attributo, usa `data-c="home.nuovaFrase"` sul tag e
   aggiungi la riga corrispondente alla tabella degli attributi in
   `genera-nucleo.js`. Per il contenuto di un `<title>` serve `data-t`: dentro
   `<title>` un commento HTML non è un commento, il browser lo mostrerebbe.
3. **`admin.js`** — nella sezione giusta dell'elenco `SEZIONI`, aggiungi una riga:
   ```js
   box.appendChild(campoTesto('home.nuovaFrase', { etichetta: 'Nuova frase' }))
   ```

Poi `node genera.mjs` e controlla. Se una chiave non esiste in `contenuti.json` il
generatore si ferma con un errore chiaro invece di lasciare un buco nella pagina.

Per un **elenco** (più voci ripetute) ci sono già gli attrezzi in `admin.js`:
`elencoTesti` per liste di frasi, `elencoSchede` per liste di schede con più campi.
Il blocco corrispondente si aggiunge a `BLOCCHI`, in `genera-nucleo.js`.

Non serve fare niente per l'anteprima: attinge dalla stessa regola, quindi il
campo nuovo ci compare da solo.

---

## Dati obbligatori per legge

Sul sito di un medico la **P. IVA** e il **numero di iscrizione all'Ordine** sono
obbligatori (pubblicità sanitaria, L. 175/1992 e DL 145/2007). Stanno nel footer di
tutte e quattro le pagine, generato da un unico blocco: si cambiano dal pannello,
sezione "Studio e contatti", e si aggiornano ovunque insieme.

- **P. IVA 01367340039**
- **Ordine dei Medici Chirurghi e Odontoiatri del Verbano-Cusio-Ossola, n. 604**

Va tenuto anche l'**avviso** in fondo ("le informazioni hanno finalità informativa
e non sostituiscono la visita medica"): nel pannello sta in fondo alla sezione
"Domande frequenti".

**Il tono dei testi** deve restare informativo, mai promozionale: la pubblicità
sanitaria in Italia vieta formule come "i migliori risultati", "eccellenza",
"risolviamo" (art. 9 legge 145/2018). Si scrive che cos'è e a cosa serve.

I dati di oggi, per riferimento: Dott.ssa Roberta Zanetta, Dermatologia e
Venereologia, telefono **351 511 8880** (`tel:+393515118880`), **Piazza Castello 27,
28921 Verbania (VB)** — Verbania Intra, non il CAP generico 28900: è l'indirizzo
della scheda Google, quella che i pazienti seguono per arrivare. Email
`dermozanetta@gmail.com`. Orari lun 14:30–19, mar 10–17, mer 14–18, gio 14:30–19,
ven 10–17, sabato e domenica chiuso.

---

## Colori

Tutti in cima a `style.css`, nel blocco `:root`. Cambiare `--terracotta` cambia
bottoni e dettagli in tutto il sito. Il pannello usa la stessa palette
(`admin.css`), così le due cose restano visivamente parenti.

```css
--crema:      #fdf8f3;  /* sfondo pagina */
--sabbia:     #f4e9de;  /* sfondo sezioni alternate */
--terracotta: #c0764e;  /* bottoni, filetti, accenti */
--salvia:     #7f8f7a;  /* eyebrow, pallini elenco */
--bruno:      #3b2e27;  /* testo principale, footer */
```

---

## Se qualcosa va storto

| Sintomo | Cosa succede davvero |
|---|---|
| Il pannello dice **"Non trovo il file dei contenuti"** | è stato aperto con doppio clic invece che dal sito. Va aperto da `https://dermozanetta.it/admin.html` |
| **"Il codice di collegamento non è valido o è scaduto"** | il token GitHub è scaduto o è stato revocato. Se ne crea uno nuovo e si rifà il collegamento. Le modifiche già fatte restano salvate sul dispositivo |
| Ho pubblicato ma **il sito è uguale** | aspetta due minuti e ricarica con `Ctrl+F5`. Se dopo cinque minuti è ancora uguale, guarda la scheda **Actions** su GitHub: se c'è una crocetta rossa, il generatore si è fermato e il messaggio dice perché |
| **"Qualcun altro ha modificato il sito nel frattempo"** | il file è cambiato da un altro dispositivo. Ricarica il pannello e rifai la modifica: è la protezione che impedisce di cancellare il lavoro altrui |
| `genera.mjs` dice **"chiave assente in contenuti.json"** | in una pagina c'è un segnaposto `<!--T:...-->` che punta a una voce che non esiste. O si aggiunge la voce, o si toglie il segnaposto |
| `genera.mjs` dice **"blocco sconosciuto"** | c'è un `<!--B:nome-->` senza la funzione corrispondente in `BLOCCHI`, dentro `genera.mjs` |
| Ho sostituito una foto e **si vede ancora la vecchia** | non dovrebbe succedere: il pannello dà un nome nuovo a ogni foto. Se capita, è la cache del browser: `Ctrl+F5` |

Le vecchie foto sostituite restano in `img/`: non danno fastidio (un file che
nessuna pagina richiama non viene mai scaricato) e ogni tanto si possono ripulire
a mano.

---

## Checklist prima di pubblicare

- [x] Telefono, indirizzo e nome corretti — si controllano in un punto solo, dal pannello
- [x] **P. IVA** e **numero di iscrizione all'Ordine** nel footer di tutte le pagine
- [x] Email dello studio nei contatti, nei dati strutturati e nella privacy
- [x] Orari reali nella tabella **e** nei dati per Google (li allinea il generatore:
  non sono più due punti da tenere d'accordo a mano)
- [ ] **Record DNS inseriti dal registrar** e *Enforce HTTPS* attivo su GitHub
  (vedi "Dominio personalizzato")
- [x] Foto vere al posto dei segnaposto in `img/`
- [ ] Cliccati tutti i bottoni "Chiama" e il link a Google Maps
- [ ] Provato il sito da telefono: il menu si apre, il bottone "Chiama" in basso funziona
- [ ] Provato **anche il pannello** da telefono: è pensato per funzionare lì

---

## Pubblicare

Sito statico: si carica la cartella su un qualsiasi hosting, oppure si attiva
GitHub Pages (Settings del repository → Pages → Source: *Deploy from a branch* →
branch `main`, cartella `/ (root)`).

Attenzione a una cosa sola: l'azione automatica in `.github/workflows/genera.yml`
ha bisogno del permesso di scrivere. Se mai smettesse di funzionare, controlla
Settings → Actions → General → *Workflow permissions* → **Read and write**.

---

## Dominio personalizzato

Il dominio **`dermozanetta.it`** è stato registrato l'11 settembre 2026 ed è già
scritto dentro il sito: i tag `<link rel="canonical">` di tutte le pagine, la
`sitemap.xml`, il `robots.txt` e i tag `og:` puntano lì. Il file `CNAME` accanto a
`index.html` contiene la riga `dermozanetta.it`.

Il dominio **senza `www`** è quello principale: è la forma usata nei canonical.
`www.dermozanetta.it` funziona grazie al record CNAME qui sotto, e GitHub lo
reindirizza da solo sul dominio nudo.

### Cosa resta da fare (una volta sola)

**1. DNS — dal pannello del registrar.** Sono cinque record:

| Tipo | Nome | Valore |
|---|---|---|
| A | `@` (dominio nudo) | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `filippoborioli-ai.github.io` |

I quattro record A sono gli indirizzi ufficiali di GitHub Pages: servono tutti e
quattro, sono quattro server diversi. Il valore del CNAME finisce con un punto in
alcuni pannelli (`filippoborioli-ai.github.io.`): è normale.

**2. GitHub.** Settings del repository → Pages → campo *Custom domain*: scrivi
`dermozanetta.it` e salva. Il file `CNAME` c'è già, quindi di solito il campo
risulta compilato da solo dopo il primo push.

**3. Aspettare il DNS.** Da qualche minuto a qualche ora. Finché non è propagato
GitHub scrive *"Domain's DNS record could not be verified"*: non è un errore da
correggere, è solo da aspettare.

**4. Enforce HTTPS.** Nella stessa pagina, quando la spunta diventa cliccabile,
attivala. Il certificato è gratuito e si rinnova da solo.

### Controllare che sia andato a buon fine

```bash
nslookup dermozanetta.it        # deve rispondere i quattro 185.199.x.153
curl -I https://dermozanetta.it # deve rispondere HTTP/2 200
```

### Il rinnovo

Il dominio va rinnovato ogni anno presso il registrar. Se scade, il sito sparisce:
resta raggiungibile solo l'indirizzo `github.io`. Conviene attivare il rinnovo
automatico e controllare che l'email del registrante (`zanettaroberta@yahoo.it`,
diversa da quella di contatto del sito) sia una casella letta davvero — gli avvisi
di scadenza arrivano lì.

---

## Privacy

`privacy.html` è l'informativa del sito, collegata dal footer di tutte le pagine.

Dice quello che oggi è vero: **nessun cookie, nessun modulo, nessuna statistica**.
Per questo il sito non ha (e non deve avere) il banner dei cookie: non c'è niente
da far accettare.

> Se un domani si aggiunge **Google Analytics**, una **mappa Google incorporata**
> (`<iframe>`), un **modulo di contatto**, il **pulsante WhatsApp** o i **font di
> Google caricati da internet**, l'informativa diventa falsa e serve anche il banner
> dei cookie. In quel caso `privacy.html` va riscritta: nel file c'è un commento
> HTML che lo ricorda, proprio sopra il testo.

Il pannello non salva niente su nessun server: le modifiche non ancora pubblicate
restano nel browser di chi le scrive, e da lì vanno solo a GitHub. Non cambia
nulla per i visitatori del sito, quindi l'informativa resta valida.

L'informativa del sito è cosa diversa da quella firmata in studio, che riguarda i
dati sanitari del paziente: la pagina lo dice fin dalla prima riga.

---

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
  la scheda Google e il sito (coerenza "NAP" — Name, Address, Phone). Discrepanze
  anche piccole confondono Google e indeboliscono il posizionamento. **È già
  successo**: il sito diceva "Via Castello 27, 28900" mentre la scheda Google dice
  "Piazza Castello 27, 28921". Ha vinto la scheda Google, perché è quella gestita
  dalla dottoressa e quella che i pazienti seguono per arrivare. Se correggi un
  indirizzo, correggilo in tutti e due i posti lo stesso giorno.
- Categoria principale: "Dermatologo".
- Orari identici a quelli sul sito.
- Foto vere dello studio caricate sulla scheda (le stesse del sito vanno bene).
- Sito web nel campo apposito della scheda → punta a `https://dermozanetta.it`.
  Il sito già punta alla scheda (campo `sameAs` nei dati strutturati): fatti i due
  collegamenti, Google capisce che sito e scheda sono la stessa attività.
- **Recensioni**: probabilmente il fattore singolo più pesante per il pacchetto
  locale. Chiedi ai pazienti soddisfatti di lasciarne una — il link diretto alla
  pagina delle recensioni si genera dalla scheda Google Business stessa.

### 2. Google Search Console — perché Google trovi e legga il sito

Su [search.google.com/search-console](https://search.google.com/search-console/):
aggiungi la proprietà col dominio, verificala (un record DNS TXT, o un tag HTML che
Google fornisce), poi invia `sitemap.xml` da lì (menu Sitemap). Senza questo passo
Google trova comunque il sito prima o poi, ma può volerci settimane.

### 3. Cosa c'è già nel sito che aiuta

- `<title>` e `<meta description>` con "dermatologa" e "Verbania" su tutte le
  pagine — modificabili dal pannello, sezione "Google".
- Dati strutturati `schema.org/Physician` in fondo a `index.html` con indirizzo,
  coordinate, orari e l'elenco delle prestazioni: li riscrive il generatore, quindi
  **non possono più andare fuori sincrono** con quello che si legge in pagina.
- Dati strutturati `FAQPage` su `domande.html`: possono far comparire le domande
  direttamente nei risultati di ricerca.
- `robots.txt` e `sitemap.xml` compilati con `dermozanetta.it`. Il `<lastmod>` delle
  pagine modificate lo aggiorna il generatore da solo.
- Sito veloce e senza dipendenze esterne: la velocità è un fattore di
  posizionamento, e un sito statico come questo parte avvantaggiato. Le foto
  caricate dal pannello vengono compresse apposta per non rovinare questo punto.

### 4. Citazioni locali (backlink) — da fare una volta, aiutano nel tempo

Registrare lo studio, con **nome indirizzo e telefono identici** al sito, su:

- Directory mediche: [MioDottore](https://www.miodottore.it), [Dottori.it](https://www.dottori.it)
- Directory generiche: PagineGialle, PagineBianche
- Sito dell'Ordine dei Medici Chirurghi e Odontoiatri del Verbano-Cusio-Ossola

### Cosa NON serve

Non serve un blog, non servono "parole chiave" nascoste nel testo, non serve pagare
per pubblicità display generica. Per una ricerca locale come "dermatologo Verbania"
contano quasi solo: scheda Google curata e con recensioni, dati coerenti ovunque, e
un sito veloce che li conferma.
