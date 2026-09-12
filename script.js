/* Menu mobile, anno nel footer, elenco prestazioni e ricerca.
   Niente librerie: il sito resta leggero e funziona anche aperto
   con doppio clic, senza server. I testi stanno in contenuti.json
   e li scrive nelle pagine genera.mjs. */
(function () {

  /* ---------- Menu mobile ---------- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    // Chiude il menu dopo il clic su una voce.
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Anno nel footer ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Prestazioni ----------
     Le schede NON le disegna piu' il browser: stanno gia' scritte
     nell'HTML, generate da contenuti.json con `node genera.mjs`. Il motivo e'
     Google: quello che appare solo dopo il JavaScript rischia di non
     finire nell'indice, e le prestazioni sono le parole con cui i
     pazienti cercano. Qui restano solo le parti che il browser deve
     fare davvero: la barra del carosello e la ricerca. */
  var box = document.getElementById('elencoPrestazioni');
  if (!box) return;

  /* ---------- Linea di scorrimento del carosello (solo home) ----------
     Indica quanto elenco resta e dove ci si trova; si puo' trascinare.
     Serve un indizio visibile perche' su desktop la rotellina del mouse
     scorre in verticale, non in orizzontale. */
  var barra = document.querySelector('.carosello-barra');
  if (barra) {
    var pallino = barra.querySelector('span');

    var aggiornaBarra = function () {
      var scorrimento = box.scrollWidth - box.clientWidth;
      // Se le schede entrano tutte, la barra non serve.
      barra.hidden = scorrimento <= 1;
      if (barra.hidden) return;
      var quota = box.clientWidth / box.scrollWidth;          // porzione visibile
      pallino.style.width = (quota * 100) + '%';
      pallino.style.left = ((box.scrollLeft / scorrimento) * (1 - quota) * 100) + '%';
    };

    // Trascinamento (e clic) sulla barra. I listener stanno sul
    // documento: cosi' il trascinamento continua anche se il puntatore
    // esce dalla barra, che e' alta pochi pixel.
    var traina = false;

    var trascina = function (e) {
      var r = barra.getBoundingClientRect();
      var quota = box.clientWidth / box.scrollWidth;
      var utile = r.width * (1 - quota);                      // corsa del pallino
      if (utile <= 0) return;
      var pos = e.clientX - r.left - (r.width * quota) / 2;   // pallino centrato sul dito
      var frazione = Math.min(Math.max(pos / utile, 0), 1);
      box.scrollLeft = frazione * (box.scrollWidth - box.clientWidth);
    };

    barra.addEventListener('pointerdown', function (e) {
      traina = true;
      // Durante il trascinamento niente scorrimento morbido, altrimenti
      // la barra insegue il dito con un ritardo.
      box.style.scrollBehavior = 'auto';
      trascina(e);
      e.preventDefault();
    });
    document.addEventListener('pointermove', function (e) {
      if (traina) trascina(e);
    });
    document.addEventListener('pointerup', function () {
      if (!traina) return;
      traina = false;
      box.style.scrollBehavior = '';
    });

    box.addEventListener('scroll', aggiornaBarra, { passive: true });
    window.addEventListener('resize', aggiornaBarra);
    aggiornaBarra();
  }

  /* ---------- Ricerca (solo in prestazioni.html) ---------- */
  var campo = document.getElementById('cerca');
  var esito = document.getElementById('esitoRicerca');
  if (!campo) return;

  // Toglie accenti e maiuscole: "psoriasi" trova anche "Psoriàsi".
  function normalizza(t) {
    return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // Le schede ci sono tutte: la ricerca nasconde quelle che non
  // corrispondono, invece di ridisegnare l'elenco. Il testo su cui
  // cerca sta in data-cerca, gia' senza accenti, e comprende le chiavi
  // scritte nel pannello (chi ha l'acne scrive "brufoli").
  var schede = box.querySelectorAll('.card');

  campo.addEventListener('input', function () {
    var q = normalizza(campo.value).trim();
    var parole = q ? q.split(/\s+/) : [];
    var trovate = 0;

    Array.prototype.forEach.call(schede, function (el) {
      var testo = el.dataset.cerca || '';
      var ok = parole.every(function (parola) { return testo.indexOf(parola) !== -1; });
      el.hidden = !ok;
      if (ok) trovate++;
    });

    if (!esito) return;
    if (!q) esito.textContent = '';
    else if (!trovate) esito.textContent = 'Nessuna prestazione trovata. Chiama lo studio: 351 511 8880.';
    else esito.textContent = trovate === 1 ? '1 prestazione trovata.' : trovate + ' prestazioni trovate.';
  });
})();
