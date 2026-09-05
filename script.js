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

  // Sulla home ne mostriamo solo alcune: data-quante="9" (le prime
  // dell'elenco in dati.js). In prestazioni.html l'attributo non c'e'
  // e si disegnano tutte.
  var quante = parseInt(box.dataset.quante, 10);
  var lista = quante > 0 ? PRESTAZIONI.slice(0, quante) : PRESTAZIONI;
  disegna(box, lista);

  /* ---------- Frecce del carosello (solo home) ----------
     Una freccia si disabilita quando da quella parte non c'e' piu' nulla
     da scorrere. */
  var carosello = box.closest('.carosello');
  if (carosello) {
    var frecce = carosello.querySelectorAll('.carosello-freccia');

    var aggiornaFrecce = function () {
      // 1px di tolleranza: gli arrotondamenti dello scroll possono
      // lasciare frazioni di pixel e far lampeggiare la freccia.
      var restaASinistra = box.scrollLeft > 1;
      var restaADestra = box.scrollLeft < box.scrollWidth - box.clientWidth - 1;
      frecce.forEach(function (f) {
        f.disabled = f.dataset.dir === '-1' ? !restaASinistra : !restaADestra;
      });
    };

    frecce.forEach(function (f) {
      f.addEventListener('click', function () {
        // Scorre di una "pagina" intera, meno una scheda gia' visibile.
        var passo = Math.max(box.clientWidth * 0.8, 200);
        box.scrollBy({ left: passo * Number(f.dataset.dir), behavior: 'smooth' });
      });
    });

    box.addEventListener('scroll', aggiornaFrecce, { passive: true });
    window.addEventListener('resize', aggiornaFrecce);
    aggiornaFrecce();
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
