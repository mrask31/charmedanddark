export const PINTEREST_TAG_ID = '2612491816640';

export function canTrackPinterest({ hostname, pathname, production, globalPrivacyControl, doNotTrack }) {
  return production && hostname === 'www.charmedanddark.com'
    && globalPrivacyControl !== true && doNotTrack !== '1' && doNotTrack !== 'yes'
    && !/^\/(admin|auth|reset-password|recover-cart|sanctuary|mirror|commerce-preview-check)(\/|$)/.test(pathname);
}

/** Basic page visits only. No customer identifiers or enhanced-match payload. */
export function trackPinterestPage(win, doc, pathname) {
  if (!canTrackPinterest({
    hostname: win.location.hostname, pathname,
    production: process.env.NODE_ENV === 'production',
    globalPrivacyControl: win.navigator.globalPrivacyControl,
    doNotTrack: win.navigator.doNotTrack,
  })) return;

  if (!win.pintrk) {
    const pintrk = function (...args) { pintrk.queue.push(args); };
    pintrk.queue = [];
    pintrk.version = '3.0';
    win.pintrk = pintrk;
    const script = doc.createElement('script');
    script.async = true;
    script.src = 'https://s.pinimg.com/ct/core.js';
    doc.head.appendChild(script);
    pintrk('load', PINTEREST_TAG_ID);
    pintrk('page');
  }

  // Prevent duplicate events from effect reruns; allow visits after navigation back.
  if (win.__cdPinterestPath === pathname) return;
  win.__cdPinterestPath = pathname;
  win.pintrk('track', 'pagevisit');
}
