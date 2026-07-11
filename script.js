/* ==========================================================================
   Derrick Chong — Portfolio
   Vanilla JS: nav, expandable cards, scroll reveal, form validation
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Current year in footer ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var navMenu = document.getElementById("nav-menu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var open = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close the menu after tapping a link (mobile)
    navMenu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Expandable experience cards ---------- */
  var cards = document.querySelectorAll(".exp-card");

  cards.forEach(function (card) {
    var btn = card.querySelector(".exp-summary");
    if (!btn) return;

    btn.addEventListener("click", function () {
      var isOpen = card.classList.contains("is-open");

      // Close any other open card so only one is expanded at a time
      cards.forEach(function (other) {
        if (other !== card) {
          other.classList.remove("is-open");
          var otherBtn = other.querySelector(".exp-summary");
          if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
        }
      });

      card.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  /* ---------- Scroll-reveal animation ---------- */
  var revealTargets = document.querySelectorAll(
    ".section-title, .section-intro, .about-copy, .about-facts, " +
    ".exp-card, .lead-card, .skill-group, .contact-copy, .contact-form"
  );

  revealTargets.forEach(function (el) { el.classList.add("reveal"); });

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: show everything
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Active nav link on scroll ---------- */
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".nav-link:not(.nav-link--cta)");

  if ("IntersectionObserver" in window && sections.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === "#" + entry.target.id
            );
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Contact form validation ---------- */
  var form = document.getElementById("contact-form");
  if (!form) return;

  var fields = {
    name: {
      input: document.getElementById("cf-name"),
      error: document.getElementById("cf-name-error"),
      validate: function (value) {
        if (!value.trim()) return "Please enter your name.";
        return "";
      }
    },
    email: {
      input: document.getElementById("cf-email"),
      error: document.getElementById("cf-email-error"),
      validate: function (value) {
        if (!value.trim()) return "Please enter your email address.";
        // Simple, pragmatic email pattern
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!re.test(value.trim())) return "That doesn't look like a valid email.";
        return "";
      }
    },
    message: {
      input: document.getElementById("cf-message"),
      error: document.getElementById("cf-message-error"),
      validate: function (value) {
        if (!value.trim()) return "Please write a short message.";
        if (value.trim().length < 10) return "Message should be at least 10 characters.";
        return "";
      }
    }
  };

  var statusEl = document.getElementById("form-status");

  function validateField(key) {
    var f = fields[key];
    var msg = f.validate(f.input.value);
    f.error.textContent = msg;
    f.input.classList.toggle("is-invalid", Boolean(msg));
    f.input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }

  // Validate on blur, clear errors while retyping
  Object.keys(fields).forEach(function (key) {
    var f = fields[key];
    f.input.addEventListener("blur", function () { validateField(key); });
    f.input.addEventListener("input", function () {
      if (f.input.classList.contains("is-invalid")) validateField(key);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var allValid = Object.keys(fields)
      .map(validateField)
      .every(Boolean);

    statusEl.classList.remove("is-success", "is-error");

    if (!allValid) {
      statusEl.textContent = "Please fix the highlighted fields and try again.";
      statusEl.classList.add("is-error");
      // Move focus to the first invalid field
      var firstInvalid = form.querySelector(".is-invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    /* NOTE — hooking up real delivery:
       This is a static site, so there's no server to receive the form.
       The easiest options (no backend code required):
         1. Formspree — set form action="https://formspree.io/f/YOUR_ID" method="POST"
            and remove this JS submit interception (keep validation).
         2. Netlify Forms — add a `netlify` attribute to the <form> tag if you
            deploy on Netlify.
       Until then, we fall back to opening the visitor's email client: */
    var name = fields.name.input.value.trim();
    var email = fields.email.input.value.trim();
    var message = fields.message.input.value.trim();

    var subject = encodeURIComponent("Portfolio contact from " + name);
    var body = encodeURIComponent(message + "\n\n— " + name + " (" + email + ")");
    window.location.href =
      "mailto:chongderrick15@gmail.com?subject=" + subject + "&body=" + body;

    statusEl.textContent = "Thanks, " + name + "! Your email app should open — just hit send.";
    statusEl.classList.add("is-success");
    form.reset();
  });
})();
