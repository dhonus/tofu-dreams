// Cooking mode — keep the screen awake while cooking (Screen Wake Lock API).
// The header bar ("Recipe" + toggle) is rendered server-side (partials/recipe-header.html)
// so nothing shifts on load; this only wires up the toggle's behaviour. The button
// ships hidden and is revealed here only when the browser supports wake lock.
(function () {
    var toggle = document.querySelector('.recipe-header .cook-toggle');
    if (!toggle) return;

    // No wake-lock support: leave the toggle hidden (the "Recipe" title bar stays).
    if (!('wakeLock' in navigator) || !navigator.wakeLock || !navigator.wakeLock.request) {
        return;
    }

    var textEl = toggle.querySelector('.cook-toggle-text');
    // reserved via `visibility: hidden` in CSS so revealing it causes NO reflow
    // (which would otherwise shift the header height and creep the scroll on reload)
    toggle.style.visibility = 'visible';

    var lock = null;
    var on = false;

    function paint() {
        toggle.classList.toggle('is-on', on);
        toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
        textEl.textContent = on ? 'Screen awake' : 'Cooking mode';
    }

    function enable() {
        navigator.wakeLock.request('screen').then(function (l) {
            lock = l;
            lock.addEventListener('release', function () { on = false; lock = null; paint(); });
            on = true; paint();
        }).catch(function () {
            on = false; paint();
            textEl.textContent = 'Tap to retry';
        });
    }

    function disable() {
        if (lock) { try { lock.release(); } catch (e) {} lock = null; }
        on = false; paint();
    }

    toggle.addEventListener('click', function () {
        if (on) disable(); else enable();
    });

    // Re-acquire the lock if the tab was backgrounded then shown again while on.
    document.addEventListener('visibilitychange', function () {
        if (on && document.visibilityState === 'visible') enable();
    });
})();
