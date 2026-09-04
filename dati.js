/* =====================================================================
   ELENCO DELLE PRESTAZIONI — l'unico file da modificare per cambiarle
   =====================================================================

   Le prestazioni compaiono in due punti:
     - home (index.html): le PRIME 6 di questo elenco;
     - pagina prestazioni.html: tutte, con la casella di ricerca.
   Cambi qui, cambiano in tutte e due. Nessun HTML da toccare.

   PER MODIFICARE UN TESTO
       cambia il testo fra apici, lasciando apici e virgola al loro posto.

   PER AGGIUNGERE UNA PRESTAZIONE
       copia un blocco intero da { a }, virgola compresa, e incollalo dove
       vuoi che compaia. L'ordine dell'elenco è l'ordine sulla pagina.

   PER RIMUOVERNE UNA
       cancella il blocco da { a } compresa la virgola finale.

   ATTENZIONE AGLI APICI
       se dentro il testo serve un apostrofo, scrivilo così: dell\'esame
       (con la barra rovesciata), oppure usa l'apostrofo tipografico ’.

   ATTENZIONE AL TONO
       le descrizioni devono restare informative, mai promozionali: la
       pubblicità sanitaria in Italia lo vieta (art. 9 legge 145/2018).
       Niente "i migliori risultati", "eccellenza", "risolviamo": solo
       che cos'è e a cosa serve.

   chiavi = parole con cui i pazienti cercano davvero (chi ha l'acne
   scrive "brufoli", non "acne volgare"). Non si vedono sulla pagina:
   servono solo alla casella di ricerca. Puoi anche lasciarle vuote.
   ===================================================================== */

const PRESTAZIONI = [
  {
    nome: 'Visita dermatologica',
    testo: 'Valutazione della pelle, delle mucose, dei capelli e delle unghie, con anamnesi ed esame clinico.',
    chiavi: 'generale prima visita controllo pelle cute derma',
  },
  {
    nome: 'Mappatura dei nei (dermatoscopia digitale)',
    testo: 'Esame dei nei con dermatoscopio e archiviazione delle immagini, per confrontarle nei controlli successivi.',
    chiavi: 'nei neo nevi mappatura melanoma epiluminescenza controllo macchie',
  },
  {
    nome: 'Controllo di un singolo neo',
    testo: 'Valutazione mirata di una lesione comparsa da poco o cambiata di forma, colore o dimensione.',
    chiavi: 'neo cambiato cresciuto sanguina prude macchia scura',
  },
  {
    nome: 'Acne e cicatrici da acne',
    testo: 'Inquadramento della forma di acne e impostazione della terapia, con controlli nel tempo.',
    chiavi: 'acne brufoli foruncoli punti neri comedoni pelle grassa adolescenti cicatrici',
  },
  {
    nome: 'Psoriasi',
    testo: 'Diagnosi e gestione della psoriasi cutanea, con valutazione delle terapie disponibili.',
    chiavi: 'psoriasi placche squame chiazze rosse gomiti ginocchia cuoio capelluto',
  },
  {
    nome: 'Dermatite atopica ed eczemi',
    testo: 'Valutazione delle dermatiti, individuazione dei fattori scatenanti e terapia.',
    chiavi: 'dermatite eczema atopica seborroica da contatto prurito pelle secca irritazione arrossamento',
  },
  {
    nome: 'Orticaria e reazioni allergiche cutanee',
    testo: 'Inquadramento delle manifestazioni orticarioidi e delle reazioni cutanee di natura allergica.',
    chiavi: 'orticaria pomfi allergia gonfiore prurito reazione punture',
  },
  {
    nome: 'Micosi di pelle e unghie',
    testo: 'Diagnosi delle infezioni da funghi di cute e unghie e impostazione del trattamento.',
    chiavi: 'micosi funghi unghie onicomicosi piede atleta candida macchie bianche',
  },
  {
    nome: 'Verruche, condilomi e mollusco contagioso',
    testo: 'Valutazione e trattamento delle lesioni di origine virale della cute e delle mucose.',
    chiavi: 'verruche porri condilomi papilloma hpv mollusco contagioso',
  },
  {
    nome: 'Caduta dei capelli e malattie del cuoio capelluto',
    testo: 'Valutazione tricologica della caduta dei capelli e delle patologie del cuoio capelluto.',
    chiavi: 'capelli caduta calvizie alopecia diradamento forfora tricologia cuoio capelluto',
  },
  {
    nome: 'Malattie sessualmente trasmissibili (venereologia)',
    testo: 'Valutazione e gestione delle infezioni a trasmissione sessuale con manifestazioni cutanee o mucose.',
    chiavi: 'venereologia mst ist infezioni genitali herpes sifilide',
  },
  {
    nome: 'Cheratosi attiniche e tumori della pelle',
    testo: 'Valutazione delle lesioni legate all’esposizione solare e dei tumori cutanei, con indicazioni sul percorso da seguire.',
    chiavi: 'cheratosi attiniche sole tumore carcinoma basalioma melanoma lesioni precancerose',
  },
  {
    nome: 'Crioterapia',
    testo: 'Trattamento ambulatoriale di alcune lesioni cutanee mediante applicazione di azoto liquido.',
    chiavi: 'crioterapia azoto liquido verruche cheratosi lesioni',
  },
  {
    nome: 'Asportazione e biopsia di lesioni cutanee',
    testo: 'Piccoli interventi ambulatoriali con eventuale invio del prelievo all’esame istologico.',
    chiavi: 'asportazione biopsia rimozione neo cisti chirurgia ambulatoriale istologico punti',
  },
  {
    nome: 'Dermatologia pediatrica',
    testo: 'Valutazione dei problemi della pelle in bambini e ragazzi.',
    chiavi: 'bambini pediatrica neonato ragazzi angiomi crosta lattea dermatite pannolino',
  },
];
