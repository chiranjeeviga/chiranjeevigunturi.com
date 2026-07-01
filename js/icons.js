(function () {
  "use strict";
  if (window.rough) {
    // Icons bake stroke colours at draw time, so a theme flip must REDRAW them.
    // Everything below runs inside render(), which re-reads the tokens fresh and
    // clears each SVG first; it runs on load and again on the "themechange" event.
    var render = function () {
    var css = getComputedStyle(document.documentElement);
    var inkColor = css.getPropertyValue("--ink").trim() || "#24262e";
    var drawInto = function (id, fn) {
      var svg = document.getElementById(id);
      if (!svg) return;
      while (svg.firstChild) svg.removeChild(svg.firstChild); // clear before redraw
      var rc = rough.svg(svg);
      fn(rc, function (node) { svg.appendChild(node); });
    };
    var S = function (r, w, seed, bow) { return { roughness: r, stroke: inkColor, strokeWidth: w || 1.7, bowing: bow == null ? 1.2 : bow, seed: seed || 1 }; };
    var SOLID = function (seed) { return { roughness: 0.8, stroke: inkColor, strokeWidth: 0.6, fill: inkColor, fillStyle: "solid", seed: seed || 1 }; };
    var R = 0.8;
    drawInto("cap-icon-1", function (rc, add) {
      add(rc.circle(32, 32, 42, S(R, 1.7, 7)));
      add(rc.polygon([[32, 16], [37.5, 32], [32, 48], [26.5, 32]], S(R, 1.7, 11)));
      add(rc.circle(32, 32, 4, SOLID(7)));
    });
    drawInto("cap-icon-2", function (rc, add) {
      add(rc.rectangle(15, 18, 34, 9, S(R, 1.7, 19)));
      add(rc.rectangle(15, 30, 34, 9, S(R, 1.7, 23)));
      add(rc.rectangle(15, 42, 34, 9, S(R, 1.7, 29)));
    });
    drawInto("cap-icon-3", function (rc, add) {
      var e = S(R, 1.5, 7, 1.5);
      add(rc.line(16, 18, 33, 33, e));
      add(rc.line(50, 21, 33, 33, e));
      add(rc.line(46, 47, 33, 33, e));
      add(rc.line(18, 45, 33, 33, e));
      add(rc.line(16, 18, 50, 21, e));
      add(rc.line(18, 45, 46, 47, e));
      add(rc.circle(33, 33, 9, SOLID(7)));
      add(rc.circle(16, 18, 7, SOLID(13)));
      add(rc.circle(50, 21, 7, SOLID(17)));
      add(rc.circle(46, 47, 7, SOLID(21)));
      add(rc.circle(18, 45, 7, SOLID(25)));
    });
    drawInto("cap-icon-4", function (rc, add) {
      add(rc.rectangle(11, 19, 42, 27, S(R, 1.7, 42)));
      add(rc.line(11, 27.5, 53, 27.5, S(R, 1.5, 43)));
      add(rc.rectangle(17, 33, 9, 7, S(R, 1.5, 44)));
    });
    var inkSoft = css.getPropertyValue("--ink-soft").trim() || "#5a5e6b";
    var Ssoft = function (r, w, seed, bow) { return { roughness: r, stroke: inkSoft, strokeWidth: w || 1.5, bowing: bow == null ? 1.2 : bow, seed: seed || 1 }; };
    var SoftSolid = function (seed) { return { roughness: 0.8, stroke: inkSoft, strokeWidth: 0.5, fill: inkSoft, fillStyle: "solid", seed: seed || 1 }; };
    drawInto("m-icon-1", function (rc, add) {
      add(rc.rectangle(12, 23, 40, 20, Ssoft(0.8, 1.6, 71)));
      add(rc.circle(32, 33, 13, Ssoft(0.8, 1.6, 72)));
    });
    drawInto("m-icon-2", function (rc, add) {
      add(rc.line(21, 32, 44, 19, Ssoft(0.8, 1.5, 74, 1.4)));
      add(rc.line(21, 32, 44, 45, Ssoft(0.8, 1.5, 75, 1.4)));
      add(rc.circle(19, 32, 9, SoftSolid(76)));
      add(rc.circle(45, 18, 9, SoftSolid(77)));
      add(rc.circle(45, 46, 9, SoftSolid(78)));
    });
    drawInto("m-icon-3", function (rc, add) {
      add(rc.path("M32 47 C 18 36 16 26 25 22 C 30 19 32 25 32 27 C 32 25 34 19 39 22 C 48 26 46 36 32 47 Z", Ssoft(0.8, 1.6, 79)));
    });
    drawInto("m-icon-4", function (rc, add) {
      add(rc.circle(20, 25, 8, Ssoft(0.8, 1.4, 82)));
      add(rc.circle(44, 25, 8, Ssoft(0.8, 1.4, 83)));
      add(rc.circle(32, 29, 12, Ssoft(0.8, 1.6, 84)));
      add(rc.path("M16 51 Q 32 37 48 51", Ssoft(0.8, 1.6, 85)));
    });
    drawInto("m-icon-5", function (rc, add) {
      add(rc.rectangle(14, 16, 36, 24, Ssoft(0.8, 1.5, 87)));
      add(rc.line(20, 40, 17, 48, Ssoft(0.8, 1.5, 88)));
      add(rc.line(17, 48, 28, 40, Ssoft(0.8, 1.5, 89)));
      add(rc.circle(24, 28, 2.6, SoftSolid(90)));
      add(rc.circle(32, 28, 2.6, SoftSolid(91)));
      add(rc.circle(40, 28, 2.6, SoftSolid(92)));
    });
    // beat dividers bake inkColor -> redraw on theme flip. Reuse the existing
    // <svg> if already inserted (guard against duplicates on re-render).
    var SVGNS = "http://www.w3.org/2000/svg";
    Array.prototype.forEach.call(document.querySelectorAll(".prose .beat"), function (beat) {
      var svg = beat.previousElementSibling;
      if (!svg || !svg.classList || !svg.classList.contains("sketch-divider")) {
        svg = document.createElementNS(SVGNS, "svg");
        svg.setAttribute("class", "sketch-divider");
        svg.setAttribute("viewBox", "0 0 60 10");
        svg.setAttribute("aria-hidden", "true");
        beat.parentNode.insertBefore(svg, beat);
      } else {
        while (svg.firstChild) svg.removeChild(svg.firstChild);
      }
      var rc = rough.svg(svg);
      svg.appendChild(rc.line(3, 5, 57, 5, { roughness: 0.9, stroke: inkColor, strokeWidth: 1.4, bowing: 2.5, seed: 101 }));
    });

    /* ---- Story-tab glyphs (24x24, hand-drawn) --------------------- *
     * Drawn with stroke "currentColor" so CSS tints them: muted by
     * default, ink when the tab is selected. Registry is keyed by the
     * tab's data-icon, so new story tabs (e.g. Gojek) just add a draw fn.
     * -------------------------------------------------------------- */
    var CC = "currentColor";
    var St = function (seed, w, bow) { return { roughness: 1.1, stroke: CC, strokeWidth: w || 1.5, bowing: bow == null ? 1.1 : bow, seed: seed || 1 }; };
    var Fill = function (seed) { return { roughness: 0.9, stroke: CC, strokeWidth: 0.5, fill: CC, fillStyle: "solid", seed: seed || 1 }; };

    var tabIcons = {
      // referral: a $5 banknote ("$5 for you, $5 for them" -> the referral reward)
      referral: function (rc, add, svg) {
        // bill body
        add(rc.rectangle(2.5, 6, 19, 12, St(202, 1.5)));
        // centre medallion
        add(rc.circle(12, 12, 6.4, St(203, 1.4)));
        // tiny corner ticks (the "5" denomination marks on a note)
        add(rc.line(4.4, 8, 6, 8, St(204, 1.2, 0)));
        add(rc.line(18, 16, 19.6, 16, St(205, 1.2, 0)));
        // crisp "$5" in the medallion (font + colour come from CSS)
        var t = document.createElementNS(SVGNS, "text");
        t.setAttribute("x", "12"); t.setAttribute("y", "12.4");
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("dominant-baseline", "central");
        t.setAttribute("class", "tab-ico-txt");
        t.textContent = "$5";
        svg.appendChild(t);
      },
      // merchant: a storefront with a scalloped awning and a door (the business you pay)
      merchant: function (rc, add) {
        // awning
        add(rc.path("M3 8 L21 8 L19.5 4.5 L4.5 4.5 Z", St(211, 1.4)));
        add(rc.path("M4.5 8 Q6 10.4 7.5 8 Q9 10.4 10.5 8 Q12 10.4 13.5 8 Q15 10.4 16.5 8 Q18 10.4 19.5 8", St(212, 1.2, 0.5)));
        // shop body
        add(rc.rectangle(4.5, 8, 15, 12, St(213, 1.5)));
        // door
        add(rc.rectangle(10, 13, 4, 7, St(214, 1.3)));
        add(rc.circle(12.9, 16.7, 0.7, Fill(215)));
      }
    };

    // tab glyphs use "currentColor" -> CSS themes them for free, so draw ONCE.
    Array.prototype.forEach.call(document.querySelectorAll(".pop__tab-ico[data-icon]"), function (svg) {
      if (svg.getAttribute("data-drawn")) return;
      var fn = tabIcons[svg.getAttribute("data-icon")];
      if (!fn) return;
      var rc = rough.svg(svg);
      fn(rc, function (node) { svg.appendChild(node); }, svg);
      svg.setAttribute("data-drawn", "1");
    });
    }; // end render()

    render();
    // the theme toggle dispatches "themechange" on <html>; redraw baked icons
    document.documentElement.addEventListener("themechange", render);
  }
})();
