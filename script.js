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

  // Sulla home ne mostriamo solo alcune: data-quante="6".
  var quante = parseInt(box.dataset.quante, 10);
  var lista = quante > 0 ? PRESTAZIONI.slice(0, quante) : PRESTAZIONI;
  disegna(box, lista);

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
