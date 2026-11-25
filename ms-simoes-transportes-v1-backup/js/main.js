/* ============================================================
   M S SIMÕES TRANSPORTES — main.js
   JavaScript vanilla, sem dependências
   ============================================================ */
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '5521995207174';

  /* ---------- Header: encolher ao rolar ---------- */
  var header = document.getElementById('header');

  function onScrollHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Menu mobile ---------- */
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');

  function closeMenu() {
    navMenu.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  navToggle.addEventListener('click', function () {
    var isOpen = navMenu.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  // Fecha o menu ao clicar em um link ou fora dele
  navMenu.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu();
  });
  document.addEventListener('click', function (e) {
    if (
      navMenu.classList.contains('is-open') &&
      !navMenu.contains(e.target) &&
      !navToggle.contains(e.target)
    ) closeMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------- Link ativo conforme a seção visível ---------- */
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.navbar__link');

  var sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
        });
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );
  sections.forEach(function (s) { sectionObserver.observe(s); });

  /* ---------- Animações de revelação ao rolar ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  var revealObserver = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach(function (el) { revealObserver.observe(el); });

  /* ---------- Contadores animados do hero ---------- */
  var counters = document.querySelectorAll('[data-counter]');

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-counter'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1600;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      // easing: easeOutCubic
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counterObserver = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach(function (c) { counterObserver.observe(c); });

  /* ---------- Botão voltar ao topo ---------- */
  var backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', function () {
    backToTop.classList.toggle('is-visible', window.scrollY > 600);
  }, { passive: true });

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Máscara de telefone ---------- */
  var phoneInput = document.getElementById('fPhone');

  phoneInput.addEventListener('input', function () {
    var digits = this.value.replace(/\D/g, '').slice(0, 11);
    var formatted = digits;
    if (digits.length > 2) {
      formatted = '(' + digits.slice(0, 2) + ') ' + digits.slice(2);
    }
    if (digits.length > 7) {
      var rest = digits.slice(2);
      var split = rest.length > 8 ? 5 : 4;
      formatted = '(' + digits.slice(0, 2) + ') ' + rest.slice(0, split) + '-' + rest.slice(split);
    }
    this.value = formatted;
  });

  /* ---------- Formulário de contato → WhatsApp ---------- */
  var form = document.getElementById('contactForm');
  var feedback = document.getElementById('formFeedback');

  function setFeedback(message, type) {
    feedback.textContent = message;
    feedback.className = 'form__feedback' + (type ? ' is-' + type : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var fields = form.querySelectorAll('input, select, textarea');
    var valid = true;

    fields.forEach(function (field) {
      var isEmpty = !field.value || !field.value.trim();
      field.classList.toggle('is-invalid', isEmpty);
      if (isEmpty) valid = false;
    });

    if (!valid) {
      setFeedback('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }

    var phoneDigits = form.telefone.value.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      form.telefone.classList.add('is-invalid');
      setFeedback('Informe um telefone válido com DDD.', 'error');
      return;
    }

    var message =
      '*Contato pelo site — M S Simões Transportes*\n\n' +
      '*Nome:* ' + form.nome.value.trim() + '\n' +
      '*Telefone:* ' + form.telefone.value.trim() + '\n' +
      '*Assunto:* ' + form.assunto.value + '\n' +
      '*Mensagem:* ' + form.mensagem.value.trim();

    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
    window.open(url, '_blank', 'noopener');

    setFeedback('Mensagem pronta! Finalize o envio no WhatsApp. ✅', 'success');
    form.reset();
    fields.forEach(function (f) { f.classList.remove('is-invalid'); });
  });

  // Remove o destaque de erro assim que o usuário digita
  form.addEventListener('input', function (e) {
    if (e.target.classList.contains('is-invalid') && e.target.value.trim()) {
      e.target.classList.remove('is-invalid');
    }
  });

  /* ---------- Ano dinâmico no footer ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
