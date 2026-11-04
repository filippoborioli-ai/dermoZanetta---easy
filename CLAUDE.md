# dermoZanetta---easy — istruzioni per Claude

Sito statico di dermozanetta.it (GitHub Pages). Cosa è cosa e come si lavora: **README.md**. Qui solo le regole da non dimenticare.

## Restyling (procedura completa: README, sezione "Restyling: come si fa")
- Si lavora su una **copia** (cartella o branch), mai su `main` finché l'utente non approva.
- Si cambiano solo `style.css`, `script.js`, `fonts/`. L'HTML lo scrive `genera.mjs`: non si ritocca a mano.
- **Approvato** → la versione vecchia va con `git mv` nella prima `vN/` libera (v1, v2, v3…), mai cancellata; poi i file nuovi.
- Dopo `node genera.mjs` controllare `git diff`: se le pagine non sono cambiate davvero, ripristinare pagine e sitemap.
- Aggiornare i `.md` (README: tabella "I file", "Colori", cronologia versioni).
- Prima di approvare: desktop 1280, telefono 390, pannello su una copia con password di test, Lighthouse.

## Git e pubblicazione
- Push normale, **mai `--force`**. Commit solo dei file del lavoro, per nome: foto cancellate o non tracciate in locale non vanno committate di nascosto.
- Mai `noindex` o `robots.txt` bloccante sul sito vero (servono solo nella copia di prova online). Mai toccare `CNAME`.
- **Alla fine di ogni lavoro verificare l'allineamento** cartella locale (VS Code) = GitHub = sito online: `git fetch`, `git status -sb`, `git rev-parse main origin/main`, `git log main..origin/main`, poi aprire il sito vero. Riferire anche i file locali non allineati.

## Dati
- `CREDENZIALI.md` è fuori da GitHub: non leggerlo, non stamparlo, non committarlo. Il pannello si prova solo su copie con password di test.
