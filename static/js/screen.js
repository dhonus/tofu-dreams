// Cooking mode — keep the screen awake while cooking (Screen Wake Lock API).
// Injects a header bar onto the recipe box ("🍳 Recipe" + a toggle). The toggle's
// own label reflects the state, so there is no separate status line.
(function () {
    var recipe = document.querySelector('div.recipe');
    if (!recipe) return;

    // --- build the header bar ---
    var header = document.createElement('div');
    header.className = 'recipe-header';

    var title = document.createElement('span');
    title.className = 'recipe-header-title';
    title.textContent = 'Recipe';

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'cook-toggle';
    toggle.setAttribute('aria-pressed', 'false');
    toggle.innerHTML =
        '<span class="cook-toggle-text">Cook mode</span>' +
        '<span class="cook-toggle-switch"><span class="cook-toggle-knob"></span></span>';

    header.appendChild(title);
    header.appendChild(toggle);
    recipe.prepend(header);

    var textEl = toggle.querySelector('.cook-toggle-text');

    // No wake-lock support: show a disabled, explanatory state.
    if (!('wakeLock' in navigator) || !navigator.wakeLock || !navigator.wakeLock.request) {
        toggle.classList.add('is-off');
        toggle.disabled = true;
        textEl.textContent = 'Not supported';
        toggle.title = "This browser can't keep the screen awake";
        return;
    }

    var lock = null;
    var on = false;

    function paint() {
        toggle.classList.toggle('is-on', on);
        toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
        textEl.textContent = on ? 'Screen awake' : 'Cook mode';
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
