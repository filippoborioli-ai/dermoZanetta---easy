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
[Domande frequenti](#modificare-le-domande-frequenti) · [Colori](#colori) ·
[Checklist prima di pubblicare](#checklist-prima-di-pubblicare) · [Pubblicare](#pubblicare)

## File

| File | Cosa contiene |
|---|---|
| `index.html` | home: medico, studio, domande, contatti |
| `prestazioni.html` | pagina con l'elenco completo e la ricerca |
| `dati.js` | **l'elenco delle prestazioni** — è qui che si aggiunge o si toglie |
| `style.css` | colori, tipografia, layout |
| `script.js` | menu mobile, anno nel footer, disegno dell'elenco e ricerca |
| `img/` | immagini (ora segnaposto `.svg`) |

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
  testo normale e uno per i dati strutturati JSON-LD) e `Verbania`
- link Google Maps: `https://maps.google.com/?cid=15553148866995770811` — questo è
  legato alla scheda Google reale dello studio, per cambiarlo serve il link della
  scheda giusta (si trova su Google Maps → Condividi, sulla scheda dello studio)

Dopo aver sostituito, apri le pagine e verifica che i bottoni "Chiama" e i link a
Google Maps puntino ancora al posto giusto.

## Dati già inseriti

Presi dal progetto principale (`assets/js/config.js` e `assets/js/prestazioni.js`):

- Dott.ssa Roberta Zanetta — Dermatologia e Venereologia
- Telefono **351 511 8880** (`tel:+393515118880`)
- Piazza Castello 27, 28921 Verbania (VB)
- Scheda Google Maps con `cid=15553148866995770811` (apre la scheda esatta, non una ricerca)
- 15 prestazioni con i testi già scritti
- Dati strutturati `schema.org/Physician` in fondo alla pagina (utili per Google)

## Da completare prima di pubblicare

1. **P. IVA e numero di iscrizione all'Ordine** — obbligatori per legge sul sito di un
   medico (pubblicità sanitaria). Nel footer c'è un commento HTML nel punto esatto, e un
   secondo commento nella sezione "Chi ti visita" per la riga dell'Ordine.
2. **Email** — nel progetto principale è ancora vuota. Quando c'è, togli il commento
   dalla riga già pronta nella sezione contatti.
3. **Orari** — ora riportano `9:00–18:00` tutti i giorni feriali (dai dati
   strutturati del sito principale). Se gli orari reali sono diversi, vedi sotto
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
risultati di ricerca. Contiene una riga `"openingHours":["Mo-Fr 09:00-18:00"]`
scritta in inglese abbreviato (Mo, Tu, We, Th, Fr, Sa, Su). Se cambi gli orari reali
aggiorna anche questa riga, altrimenti Google mostra orari sbagliati anche se la
pagina è corretta. Esempio per "lun-ven 9-18, escluso martedì pomeriggio":
`"openingHours":["Mo,We-Fr 09:00-18:00","Tu 09:00-13:00"]`.

## Foto

Le immagini in `img/` sono segnaposto (nel progetto principale le foto stanno su
Supabase, non nel repository). Si sostituiscono così:

1. Prepara le foto vere, ridimensionate a max ~1600&nbsp;px di lato e compresse
   (va bene [squoosh.app](https://squoosh.app), gratuito, si usa dal browser).
2. Dai alle foto **lo stesso nome** dei file segnaposto che vuoi sostituire, con
   l'estensione vera (`.jpg` o `.png`), e mettile dentro `img/`:

   | Segnaposto attuale | Dove compare | Taglio consigliato |
   |---|---|---|
   | `img/dottoressa.svg` | ritratto in apertura (hero) | verticale 5:6 (es. 1000×1200 px) |
   | `img/studio-2.svg` | galleria "Lo studio" — ingresso | orizzontale 3:2 (es. 1200×800 px) |
   | `img/studio-1.svg` | galleria "Lo studio" — sala visite | orizzontale 3:2 |
   | `img/studio-3.svg` | galleria "Lo studio" — sala d'attesa | orizzontale 3:2 |

3. Se usi un'estensione diversa da `.svg` (es. `dottoressa.jpg`), apri `index.html`
   e cambia l'estensione nel `src` di quell'immagine — i punti esatti sono segnati
   dai commenti `<!-- FOTO 1 -->`, `<!-- FOTO 2 -->` ecc. Cerca anche il testo
   `alt="..."` accanto e aggiornalo se la foto mostra qualcosa di diverso dal
   segnaposto (es. non più la sala visite ma lo studio dall'esterno).
4. Salva, ricarica la pagina con `Ctrl+F5` (svuota la cache) e controlla che la
   foto appaia.

Non serve toccare `style.css`: le foto si adattano da sole al riquadro (taglio
automatico, senza deformarsi) qualunque sia la proporzione reale dello scatto —
il "taglio consigliato" evita solo che venga tagliata via una parte importante
dell'inquadratura.

## Aggiungere, togliere o modificare una prestazione

Si tocca **solo `dati.js`**. Non serve aprire l'HTML: le schede compaiono da sole
sia sulla home (le prime 6) sia in `prestazioni.html` (tutte, con la ricerca).

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
  compaia: l'ordine dell'elenco è l'ordine sulla pagina (le prime 6 finiscono in home);
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

Sono in `index.html`, sezione `<section id="domande">`. Ogni domanda è un blocco:

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
mostra in quella stessa pagina di impostazioni.
