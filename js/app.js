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

  /* ---- Image lightbox (shared) ---------------------------------- *
   * The cert thumbnail and any [data-zoom] image open one lightbox.
   * The clicked image's src + alt are swapped in (alt becomes caption).
   * --------------------------------------------------------------- */
  var lb = document.getElementById("cert-lightbox");
  if (lb) {
    var lbImg = document.getElementById("lightbox-img");
    var lbCap = document.getElementById("lightbox-cap");
    var lastFocus = null;
    var showLb = function (src, alt) {
      if (src && lbImg) { lbImg.setAttribute("src", src); lbImg.setAttribute("alt", alt || ""); }
      if (lbCap) { lbCap.textContent = alt || ""; lbCap.style.display = alt ? "" : "none"; }
      lb.removeAttribute("hidden");
      document.body.style.overflow = "hidden";
    };
    var hideLb = function () {
      lb.setAttribute("hidden", "");
      document.body.style.overflow = "";
      if (lastFocus && lastFocus.focus) { lastFocus.focus(); lastFocus = null; }
    };
    // every zoomable element opens the lightbox with its own image
    Array.prototype.forEach.call(document.querySelectorAll("[data-zoom]"), function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        lastFocus = el;
        var img = el.tagName === "IMG" ? el : el.querySelector("img");
        if (img) showLb(img.getAttribute("src"), img.getAttribute("alt"));
        else showLb(); // fallback: show whatever is already in the lightbox
      });
    });
    Array.prototype.forEach.call(lb.querySelectorAll("[data-cred-close]"), function (el) {
      el.addEventListener("click", hideLb);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lb.hasAttribute("hidden")) hideLb();
    });
  }

  /* ---- Story highlight popovers ---------------------------------- *
   * Each .hl button references a .pop card (by data-pop -> #pop-<id>).
   * The same card can be referenced by more than one highlight; we move
   * each card to <body> once, then position it per click. One open at a
   * time; close on the card's button, click-away, Esc, or scroll/resize.
   * --------------------------------------------------------------- */
  (function () {
    var hls = Array.prototype.slice.call(document.querySelectorAll(".hl[data-pop]"));
    if (!hls.length) return;
    var GAP = 10;          // space between highlight and card
    var EDGE = 12;         // viewport edge padding
    var openPop = null;    // currently-open .pop
    var openHl = null;     // highlight that opened it
    var isMobile = function () { return window.matchMedia("(max-width: 640px)").matches; };

    // hoist every referenced card to <body> so positioning is page-relative
    var cards = {};
    hls.forEach(function (hl) {
      var id = hl.getAttribute("data-pop");
      if (cards[id]) return;
      var card = document.getElementById("pop-" + id);
      if (!card) return;
      document.body.appendChild(card);   // out of the hidden store
      cards[id] = card;
      // wire its close button
      var x = card.querySelector(".pop__close");
      if (x) x.addEventListener("click", function (e) { e.stopPropagation(); close(); });
      // clicks inside the card shouldn't bubble to the document-close handler
      card.addEventListener("click", function (e) { e.stopPropagation(); });
    });

    function position(card, hl) {
      if (isMobile()) { card.removeAttribute("data-side"); return; } // CSS docks it
      var r = hl.getBoundingClientRect();
      var cw = card.offsetWidth, ch = card.offsetHeight;
      var sx = window.pageXOffset, sy = window.pageYOffset;
      var vw = document.documentElement.clientWidth;

      // horizontal: center on the highlight, clamp to viewport
      var left = r.left + sx + r.width / 2 - cw / 2;
      left = Math.max(sx + EDGE, Math.min(left, sx + vw - cw - EDGE));

      // vertical: prefer below; flip above if not enough room
      var below = r.bottom + GAP + ch <= window.innerHeight - EDGE;
      var top = below ? (r.bottom + sy + GAP) : (r.top + sy - ch - GAP);
      card.setAttribute("data-side", below ? "bottom" : "top");

      // arrow x: point at the highlight's center, within the card
      var arrowX = (r.left + sx + r.width / 2) - left;
      arrowX = Math.max(16, Math.min(arrowX, cw - 16));
      card.style.setProperty("--arrow-x", arrowX + "px");

      card.style.left = left + "px";
      card.style.top = top + "px";
    }

    function open(hl) {
      var id = hl.getAttribute("data-pop");
      var card = cards[id];
      if (!card) return;
      if (openPop === card) { close(); return; } // toggle off
      close();
      card.removeAttribute("hidden");
      position(card, hl);
      // next frame -> trigger enter transition
      requestAnimationFrame(function () { card.classList.add("is-open"); });
      hl.setAttribute("aria-expanded", "true");
      openPop = card; openHl = hl;
    }

    function close() {
      if (!openPop) return;
      openPop.classList.remove("is-open");
      var card = openPop, hl = openHl;
      // hide after the transition so it's removed from a11y tree
      window.setTimeout(function () {
        if (!card.classList.contains("is-open")) card.setAttribute("hidden", "");
      }, 180);
      if (hl) hl.setAttribute("aria-expanded", "false");
      openPop = null; openHl = null;
    }

    hls.forEach(function (hl) {
      hl.addEventListener("click", function (e) { e.stopPropagation(); open(hl); });
    });

    // close on click-away, Esc; reposition on scroll/resize
    document.addEventListener("click", function () { close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && openPop) {
        var hl = openHl;        // capture before close() nulls it
        close();
        if (hl) hl.focus();
      }
    });
    var reflow = function () {
      if (!openPop || !openHl) return;
      if (isMobile()) return;             // docked; nothing to recompute
      position(openPop, openHl);
    };
    window.addEventListener("scroll", reflow, { passive: true });
    window.addEventListener("resize", function () {
      if (openPop) close();               // simplest: close on resize
    });
  })();

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
