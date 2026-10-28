/* LAVIGO trip price calculator + WhatsApp booking.
   Pricing rule: travellers above 10 years pay the full price, children 3-10 pay half, under 3 travel free. */
(function () {
  // ---- edit these two values -------------------------------------------------
  var WHATSAPP_NUMBER = "919031474036"; // country code + number, digits only (placeholder)
  var CHILD_RATE = 0.5; // children aged 3-10 pay 50%
  // -----------------------------------------------------------------------------

  // make the number available to other links on the page (e.g. contact page)
  window.LAVIGO_WHATSAPP = WHATSAPP_NUMBER;
  Array.prototype.forEach.call(
    document.querySelectorAll("a[data-whatsapp]"),
    function (a) {
      a.href =
        "https://wa.me/" +
        WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(a.getAttribute("data-whatsapp"));
    },
  );

  var inr = function (n) {
    return "₹" + Math.round(n).toLocaleString("en-IN");
  };

  Array.prototype.forEach.call(
    document.querySelectorAll(".lavigo-booking"),
    function (box) {
      var price = parseFloat(box.getAttribute("data-price")) || 0;
      var trip = box.getAttribute("data-trip") || "LAVIGO trip";
      var duration = box.getAttribute("data-days") || "";
      var counts = { adult: 2, child: 0, infant: 0 };
      var mins = { adult: 1, child: 0, infant: 0 };

      var totalEl = box.querySelector(".lb-total-amount");
      var breakdownEl = box.querySelector(".lb-breakdown");
      var dateEl = box.querySelector(".lb-date");
      var waEl = box.querySelector(".lb-whatsapp");

      function render() {
        Object.keys(counts).forEach(function (k) {
          var out = box.querySelector('[data-count="' + k + '"]');
          if (out) out.textContent = counts[k];
          var minus = box.querySelector(
            '[data-step="' + k + '"][data-dir="-1"]',
          );
          if (minus) minus.disabled = counts[k] <= mins[k];
        });
        var adultCost = counts.adult * price;
        var childCost = counts.child * price * CHILD_RATE;
        var total = adultCost + childCost;
        totalEl.textContent = inr(total);

        var lines = [counts.adult + " × " + inr(price) + " (above 10 yrs)"];
        if (counts.child)
          lines.push(
            counts.child + " × " + inr(price * CHILD_RATE) + " (3–10 yrs)",
          );
        if (counts.infant) lines.push(counts.infant + " × free (under 3 yrs)");
        breakdownEl.innerHTML = lines.join("<br/>");

        var date = dateEl && dateEl.value ? dateEl.value : "flexible";
        var msg =
          "Hi LAVIGO! I would like to book this trip:\n" +
          "• Trip: " +
          trip +
          (duration ? " (" + duration + ")" : "") +
          "\n" +
          "• Travel date: " +
          date +
          "\n" +
          "• Travellers: " +
          counts.adult +
          " above 10 yrs, " +
          counts.child +
          " aged 3–10, " +
          counts.infant +
          " under 3\n" +
          "• Estimated total: " +
          inr(total) +
          "\n" +
          "Please confirm availability.";
        waEl.href =
          "https://wa.me/" +
          WHATSAPP_NUMBER +
          "?text=" +
          encodeURIComponent(msg);
      }

      box.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-step]");
        if (!btn) return;
        var k = btn.getAttribute("data-step");
        counts[k] = Math.min(
          30,
          Math.max(
            mins[k],
            counts[k] + parseInt(btn.getAttribute("data-dir"), 10),
          ),
        );
        render();
      });
      if (dateEl) {
        dateEl.min = new Date().toISOString().slice(0, 10);
        dateEl.addEventListener("change", render);
      }
      render();
    },
  );
})();
