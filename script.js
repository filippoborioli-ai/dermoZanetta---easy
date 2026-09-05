/* Menu mobile, anno nel footer, elenco prestazioni e ricerca.
   Niente librerie: il sito resta leggero e funziona anche aperto
   con doppio clic, senza server. L'elenco sta in dati.js. */
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
     Una scheda per prestazione. textContent e mai innerHTML: nulla di
     quello che si scrive in dati.js può diventare codice eseguibile. */
  function scheda(p) {
    var el = document.createElement('article');
    el.className = 'card';
    var h = document.createElement('h3');
    h.textContent = p.nome;
    var t = document.createElement('p');
    t.textContent = p.testo;
    el.append(h, t);
    return el;
  }

  function disegna(box, elenco) {
    box.textContent = '';
    elenco.forEach(function (p) { box.append(scheda(p)); });
  }

  var box = document.getElementById('elencoPrestazioni');
  if (!box || typeof PRESTAZIONI === 'undefined') return;

  // Senza l'attributo data-quante si disegnano tutte le prestazioni
  // (e' il caso sia della home sia di prestazioni.html); con
  // data-quante="N" solo le prime N dell'elenco in dati.js.
  var quante = parseInt(box.dataset.quante, 10);
  var lista = quante > 0 ? PRESTAZIONI.slice(0, quante) : PRESTAZIONI;
  disegna(box, lista);

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

  campo.addEventListener('input', function () {
    var q = normalizza(campo.value).trim();
    var trovate = !q ? PRESTAZIONI : PRESTAZIONI.filter(function (p) {
      var testo = normalizza(p.nome + ' ' + p.testo + ' ' + (p.chiavi || ''));
      return q.split(/\s+/).every(function (parola) { return testo.includes(parola); });
    });

    disegna(box, trovate);

    if (!esito) return;
    if (!q) esito.textContent = '';
    else if (!trovate.length) esito.textContent = 'Nessuna prestazione trovata. Chiama lo studio: 351 511 8880.';
    else esito.textContent = trovate.length === 1 ? '1 prestazione trovata.' : trovate.length + ' prestazioni trovate.';
  });
})();
