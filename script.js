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

  /* Real email delivery via FormSubmit (free, no backend needed).
     Submissions are emailed to the address below. The very FIRST submission
     triggers a one-time activation email from formsubmit.co — open it and
     click "Activate" once, and every message after that lands in your inbox. */
  var DELIVERY_EMAIL = "chongderrick15@gmail.com"; // used only for the mailto fallback
  // FormSubmit alias for chongderrick15@gmail.com — hides the address from bots
  var ENDPOINT = "https://formsubmit.co/ajax/fd07901c9310cfbd54dfbaeb7cf6c4c6";

  function mailtoFallback(name, email, message) {
    var subject = encodeURIComponent("Portfolio contact from " + name);
    var body = encodeURIComponent(message + "\n\n— " + name + " (" + email + ")");
    window.location.href =
      "mailto:" + DELIVERY_EMAIL + "?subject=" + subject + "&body=" + body;
  }

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

    var name = fields.name.input.value.trim();
    var email = fields.email.input.value.trim();
    var message = fields.message.input.value.trim();

    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    statusEl.textContent = "Sending…";

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        name: name,
        email: email,
        message: message,
        _subject: "Portfolio contact from " + name,
        _replyto: email,
        _template: "table"
      })
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function () {
        statusEl.textContent = "Thanks, " + name + "! Your message has been sent — I'll get back to you soon.";
        statusEl.classList.add("is-success");
        form.reset();
      })
      .catch(function () {
        // Network blocked or service unreachable — fall back to the visitor's email app
        mailtoFallback(name, email, message);
        statusEl.textContent = "Direct send didn't work, so your email app should open — just hit send.";
        statusEl.classList.add("is-success");
      })
      .then(function () {
        submitBtn.disabled = false;
      });
  });
})();
