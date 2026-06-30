(function () {
  "use strict";
  var docEl = document.documentElement;
  docEl.classList.remove("no-js");
  docEl.classList.add("js");

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var toggle = document.querySelector(".nav__toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
    });
  }

  var storyToggle = document.getElementById("story-toggle");
  var storyShort = document.getElementById("story-short");
  var storyFull = document.getElementById("story-full");
  if (storyToggle && storyShort && storyFull) {
    storyToggle.addEventListener("click", function () {
      var showFull = storyFull.hasAttribute("hidden");
      if (showFull) {
        storyFull.removeAttribute("hidden");
        Array.prototype.forEach.call(storyFull.querySelectorAll(".reveal"), function (el) { el.classList.add("is-visible"); });
        storyShort.setAttribute("hidden", "");
        storyToggle.textContent = "Show short version";
        storyToggle.setAttribute("aria-expanded", "true");
      } else {
        storyFull.setAttribute("hidden", "");
        storyShort.removeAttribute("hidden");
        storyToggle.textContent = "Read full story";
        storyToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  var credLb = document.getElementById("cert-lightbox");
  var credOpen = document.querySelector("[data-cred-open]");
  if (credLb && credOpen) {
    var showCred = function () { credLb.removeAttribute("hidden"); document.body.style.overflow = "hidden"; };
    var hideCred = function () { credLb.setAttribute("hidden", ""); document.body.style.overflow = ""; };
    credOpen.addEventListener("click", showCred);
    Array.prototype.forEach.call(credLb.querySelectorAll("[data-cred-close]"), function (el) { el.addEventListener("click", hideCred); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !credLb.hasAttribute("hidden")) hideCred(); });
  }

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (reduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var siblings = Array.prototype.slice.call(
        el.parentElement ? el.parentElement.querySelectorAll(":scope > .reveal") : [el]
      );
      var idx = Math.max(0, siblings.indexOf(el));
      el.style.transitionDelay = Math.min(idx * 80, 420) + "ms";
      el.classList.add("is-visible");
      io.unobserve(el);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

  reveals.forEach(function (el) { io.observe(el); });
})();
