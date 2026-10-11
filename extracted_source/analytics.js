/**
 * Game events, sent to the GA4 property already loaded in index.html.
 *
 * Consent mode starts at `analytics_storage: 'denied'` and is only granted
 * once the player accepts (see ads.js). Google drops events raised before
 * that rather than queueing them, which is the behaviour we want — but it
 * does mean every count here covers consenting players only. Read these as
 * ratios between themselves, never as absolute player totals.
 *
 * Never throws and never blocks: analytics failing is not a reason for the
 * game to stop working.
 */
export function track(name, params = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', name, params);
    }
  } catch (e) {
    // Deliberately swallowed.
  }
}

/**
 * Fire an event at most once for a given day.
 *
 * A finished round is restored from storage as readily as it is played, so
 * reporting it from a plain effect would count every reload by a player who
 * had already finished. Keyed this way the events count players per day, which
 * is what makes round 1 and round 2 comparable to each other.
 *
 * One storage key per `key`, holding the last day sent, so this cannot grow
 * without bound.
 */
export function trackOncePerDay(key, dayString, name, params = {}) {
  const storageKey = `angle.tracked.${key}`;
  try {
    if (localStorage.getItem(storageKey) === dayString) return;
    localStorage.setItem(storageKey, dayString);
  } catch (e) {
    // No storage available: send it rather than lose the event entirely.
  }
  track(name, params);
}
