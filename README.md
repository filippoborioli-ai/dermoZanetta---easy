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
| `dati.js` | **l'elenco delle prestazioni** — è qui che si aggiunge o si toglie |
| `style.css` | colori, tipografia, layout |
| `script.js` | menu mobile, anno nel footer, disegno dell'elenco e ricerca |
| `img/` | foto del sito, più `img/loghi/` per i loghi delle collaborazioni |

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
- indirizzo: `Via Castello 27` / `Via Castello, 27` (due formati, uno per il
  testo normale e uno per i dati strutturati JSON-LD), più `28900` e `Verbania`
- link Google Maps: è una ricerca sull'indirizzo testuale
  (`google.com/maps/search/?api=1&query=Via+Castello+27...`), così resta corretto
  finché l'indirizzo è giusto. Se hai il link diretto della scheda Google Business
  dello studio è meglio: porta dritto a recensioni, foto e indicazioni

Dopo aver sostituito, apri le pagine e verifica che i bottoni "Chiama" e i link a
Google Maps puntino ancora al posto giusto.

## Dati già inseriti

Presi dal progetto principale (`assets/js/config.js` e `assets/js/prestazioni.js`):

- Dott.ssa Roberta Zanetta — Dermatologia e Venereologia
- Telefono **351 511 8880** (`tel:+393515118880`)
- Via Castello 27, 28900 Verbania (VB)
- 15 prestazioni con i testi già scritti
- Dati strutturati `schema.org/Physician` in fondo alla pagina (utili per Google)

## Da completare prima di pubblicare

1. **P. IVA e numero di iscrizione all'Ordine** — obbligatori per legge sul sito di un
   medico (pubblicità sanitaria). Nel footer c'è un commento HTML nel punto esatto, e un
   secondo commento nella sezione "Chi ti visita" per la riga dell'Ordine.
2. **Email** — nel progetto principale è ancora vuota. Quando c'è, togli il commento
   dalla riga già pronta nella sezione contatti.
3. **Orari** — già inseriti quelli reali (lun 14:30–19, mar 10–17, mer 14–18,
   gio 14:30–19, ven 10–17, sabato e domenica chiuso). Per cambiarli vedi sotto
   "Modificare gli orari".

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

Il logo si adatta da solo al riquadro (altezza massima 48px, larghezza massima
180px, senza deformarsi). Funziona meglio uno sfondo bianco o trasparente: uno
sfondo colorato pieno crea uno stacco netto col resto della fascia.

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

- [ ] Telefono, indirizzo e nome corretti ovunque (vedi sezione sopra)
- [ ] **P. IVA** e **numero di iscrizione all'Ordine dei Medici** inseriti — sono
  obbligatori per legge sul sito di un medico (pubblicità sanitaria). Cerca i
  commenti `DA COMPLETARE` in `index.html` e `prestazioni.html`: segnano il punto
  esatto in cui va tolto il commento e scritto il dato vero
- [ ] Email dello studio, se attiva (riga già pronta e commentata nella sezione
  contatti di `index.html`)
- [ ] Orari reali nella tabella **e** nel blocco JSON-LD (vedi sopra: due punti,
  se aggiorni solo uno Google mostra orari sbagliati)
- [ ] Foto vere al posto dei segnaposto `.svg` in `img/`
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

L'indirizzo `github.io` funziona, ma un dominio vero (es. `www.robertazanetta.it`)
è più professionale e aiuta anche la ricerca su Google. Due pezzi: comprare il
dominio, poi collegarlo a GitHub Pages.

**1. Comprare il dominio** — un registrar qualsiasi (Aruba, Register.it, Namecheap,
Cloudflare...). Un `.it` costa in genere 10-15&nbsp;€/anno. Nessun hosting da comprare:
il sito resta su GitHub Pages, il dominio serve solo a "puntare" lì.

**2. Aggiungere il file `CNAME`** — nella cartella del sito (accanto a `index.html`)
crea un file chiamato esattamente `CNAME` (senza estensione), con dentro una riga
sola: il dominio scelto, senza `https://` né `www.` se lo usi come principale:

```
www.robertazanetta.it
```

**3. Configurare il DNS** — dal pannello del registrar, aggiungi questi record
(i nomi esatti dei campi variano da un registrar all'altro, ma il contenuto è questo):

| Tipo | Nome | Valore |
|---|---|---|
| CNAME | `www` | `tuoutente.github.io` |
| A | `@` (dominio nudo) | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

I 4 indirizzi A servono per far funzionare anche `robertazanetta.it` senza `www`
(GitHub consiglia di avere entrambi e reindirizzare l'uno sull'altro).

**4. Attivare su GitHub** — Settings → Pages → campo "Custom domain": scrivi lo
stesso dominio del file `CNAME` e salva. Il DNS impiega da qualche minuto a
qualche ora a propagarsi. Quando GitHub conferma il dominio, spunta **Enforce
HTTPS**: il certificato è gratuito e automatico, non serve comprarlo.

**5. Aggiornare i file del sito** — cerca `[DOMINIO]` in `robots.txt`,
`sitemap.xml`, `index.html` e `prestazioni.html` (nei tag `<link rel="canonical">`)
e sostituiscilo ovunque col dominio vero, es. `www.robertazanetta.it`.

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
  Phone). Discrepanze anche piccole (es. "Via Castello 27" contro "V.le Castello,
  27") confondono Google e indeboliscono il posizionamento.
- Categoria principale: "Dermatologo".
- Orari identici a quelli sul sito.
- Foto vere dello studio caricate sulla scheda (le stesse che metti nel sito vanno bene).
- Sito web nel campo apposito della scheda → punta al dominio nuovo.
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
- `robots.txt` e `sitemap.xml`: creati, da compilare col dominio vero (vedi sopra).
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
