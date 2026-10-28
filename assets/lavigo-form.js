/* LAVIGO contact form -> Netlify Forms.
   Sends the form in the background and shows the existing "Thank you" / error boxes,
   instead of Webflow's form handler (which only works on Webflow hosting). */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('form[data-netlify]'), function (form) {
    var wrap = form.closest('.w-form') || form.parentNode;
    var done = wrap.querySelector('.w-form-done');
    var fail = wrap.querySelector('.w-form-fail');
    var button = form.querySelector('[type="submit"]');

    // capture phase so Webflow's own submit handler never sees the event
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      var label = button && button.value;
      if (button) { button.value = button.getAttribute('data-wait') || 'Please wait...'; button.disabled = true; }
      fetch(form.getAttribute('action') || '/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function (res) {
        if (!res.ok) throw new Error(res.status);
        form.style.display = 'none';
        if (fail) fail.style.display = 'none';
        if (done) done.style.display = 'block';
      }).catch(function () {
        if (fail) fail.style.display = 'block';
      }).then(function () {
        if (button) { button.value = label; button.disabled = false; }
      });
    }, true);
  });
})();
