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

  /* ---- Theme toggle (light default, dark opt-in, remembered) ------ */
  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    var root = document.documentElement;
    var syncThemeBtn = function () {
      var dark = root.getAttribute("data-theme") === "dark";
      themeBtn.setAttribute("aria-pressed", String(dark));
      themeBtn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    };
    syncThemeBtn(); // reflect whatever the no-flash script set
    themeBtn.addEventListener("click", function () {
      var dark = root.getAttribute("data-theme") === "dark";
      if (dark) { root.removeAttribute("data-theme"); } else { root.setAttribute("data-theme", "dark"); }
      try { localStorage.setItem("theme", dark ? "light" : "dark"); } catch (e) {}
      syncThemeBtn();
      // tell icons.js to redraw the rough.js glyphs that bake their colour
      root.dispatchEvent(new Event("themechange"));
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

  /* ---- Story highlight drawer ------------------------------------ *
   * Each .hl button references a .pop card (by data-pop -> #pop-<id>).
   * Clicking a highlight slides a right-side drawer in and moves that
   * card into it; the same card can be referenced by several highlights.
   * Close on the drawer's button, backdrop click, or Esc. Anchored to
   * the screen, so depth content never overflows or jumps.
   * --------------------------------------------------------------- */
  (function () {
    var hls = Array.prototype.slice.call(document.querySelectorAll(".hl[data-pop]"));
    var drawer = document.getElementById("story-drawer");
    if (!hls.length || !drawer) return;
    var panel = drawer.querySelector(".drawer__panel");
    var store = document.querySelector(".pop-store");
    var openCard = null;   // .pop currently shown in the drawer
    var openHl = null;     // highlight that opened it
    var ANIM = 300;        // matches the panel slide transition

    // give each card's title a stable id so the drawer can be labelled by it
    var cards = {};
    hls.forEach(function (hl) {
      var id = hl.getAttribute("data-pop");
      if (cards[id]) return;
      var card = document.getElementById("pop-" + id);
      if (!card) return;
      cards[id] = card;
      var title = card.querySelector(".pop__title");
      if (title && !title.id) title.id = "pop-" + id + "-title";
    });

    function open(hl) {
      var id = hl.getAttribute("data-pop");
      var card = cards[id];
      if (!card) return;
      if (openCard === card) { close(); return; } // toggle off
      if (openCard) returnCard();                 // swap content if already open

      panel.appendChild(card);                    // move into the drawer
      card.removeAttribute("hidden");
      var title = card.querySelector(".pop__title");
      if (title) drawer.setAttribute("aria-labelledby", title.id);

      drawer.removeAttribute("hidden");
      document.body.style.overflow = "hidden";
      panel.scrollTop = 0;
      // next frame -> trigger slide-in
      requestAnimationFrame(function () {
        drawer.classList.add("is-open");
        if (panel.focus) panel.focus();
      });
      hl.setAttribute("aria-expanded", "true");
      openCard = card; openHl = hl;
    }

    // move the open card back to its offscreen store
    function returnCard() {
      if (!openCard) return;
      openCard.setAttribute("hidden", "");
      if (store) store.appendChild(openCard);
      if (openHl) openHl.setAttribute("aria-expanded", "false");
    }

    function close() {
      if (!openCard) return;
      var hl = openHl;
      drawer.classList.remove("is-open");
      window.setTimeout(function () {
        if (!drawer.classList.contains("is-open")) {
          returnCard();
          drawer.setAttribute("hidden", "");
          openCard = null; openHl = null;
        }
      }, ANIM);
      document.body.style.overflow = "";
      if (hl) hl.focus();                         // restore focus to the trigger
    }

    hls.forEach(function (hl) {
      hl.addEventListener("click", function (e) { e.stopPropagation(); open(hl); });
    });

    // close on the drawer's close button or backdrop
    Array.prototype.forEach.call(drawer.querySelectorAll("[data-drawer-close]"), function (el) {
      el.addEventListener("click", function (e) { e.stopPropagation(); close(); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && openCard) { e.stopPropagation(); close(); }
    });

    // ---- Tabs inside the drawer card (ARIA tablist) --------------
    Array.prototype.forEach.call(document.querySelectorAll(".pop__tabs"), function (tablist) {
      var tabs = Array.prototype.slice.call(tablist.querySelectorAll("[role='tab']"));
      var select = function (tab, focus) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute("aria-selected", String(on));
          if (on) { t.removeAttribute("tabindex"); } else { t.setAttribute("tabindex", "-1"); }
          var panelEl = document.getElementById(t.getAttribute("aria-controls"));
          if (panelEl) { if (on) { panelEl.removeAttribute("hidden"); } else { panelEl.setAttribute("hidden", ""); } }
        });
        if (focus) tab.focus();
      };
      tabs.forEach(function (tab, i) {
        tab.addEventListener("click", function (e) { e.stopPropagation(); select(tab, false); });
        tab.addEventListener("keydown", function (e) {
          var idx = null;
          if (e.key === "ArrowRight" || e.key === "ArrowDown") idx = (i + 1) % tabs.length;
          else if (e.key === "ArrowLeft" || e.key === "ArrowUp") idx = (i - 1 + tabs.length) % tabs.length;
          else if (e.key === "Home") idx = 0;
          else if (e.key === "End") idx = tabs.length - 1;
          if (idx !== null) { e.preventDefault(); e.stopPropagation(); select(tabs[idx], true); }
        });
      });
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
