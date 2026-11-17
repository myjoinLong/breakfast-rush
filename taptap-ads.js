'use strict';

const breakfastTapAds = (() => {
  const adUnitId = '1054324';
  const playbackTimeoutMs = 115000;
  let currentAd = null;
  let pending = null;

  function available() {
    return typeof window.tap?.createRewardedVideoAd === 'function';
  }

  function discard(ad) {
    if (currentAd === ad) currentAd = null;
    try { ad?.destroy?.(); } catch { /* The host already released the ad. */ }
  }

  function finish(request, ended, error) {
    if (pending !== request) return;
    pending = null;
    clearTimeout(request.timer);
    if (error) {
      // An interrupted instance can still emit callbacks from the old video.
      discard(request.ad);
      request.reject(error);
    } else request.resolve(ended);
  }

  function preload() {
    if (currentAd || !available()) return currentAd;
    let ad;
    try {
      ad = window.tap.createRewardedVideoAd({ adUnitId });
      ad.onClose(result => {
        const request = pending;
        if (request?.ad === ad && request.phase !== 'loading') {
          finish(request, result?.isEnded === true);
        }
      });
      ad.onError(error => {
        const request = pending;
        // While opening, show() handles the SDK error and its one allowed retry.
        if (request?.ad === ad && request.phase === 'playing') {
          finish(request, false, error || new Error('TapTap rewarded ad failed'));
        }
      });
      currentAd = ad;
    } catch {
      discard(ad);
      return null;
    }
    try { ad.load().catch(() => {}); } catch { /* A player action can retry loading. */ }
    return ad;
  }

  function show(request, retry = false) {
    function onFailure(error) {
      if (pending !== request) return;
      if (retry) {
        finish(request, false, error || new Error('TapTap rewarded ad could not open'));
        return;
      }
      request.phase = 'loading';
      Promise.resolve().then(() => request.ad.load()).then(() => {
        if (pending === request) show(request, true);
      }, loadError => {
        finish(request, false, loadError || new Error('TapTap rewarded ad could not load'));
      });
    }

    request.phase = 'opening';
    try {
      request.ad.show().then(() => {
        if (pending === request) request.phase = 'playing';
      }, onFailure);
    } catch (error) {
      onFailure(error);
    }
  }

  function play() {
    if (pending) return Promise.reject(new Error('A TapTap ad is already playing'));
    const ad = preload();
    if (!ad) return Promise.reject(new Error('TapTap rewarded ads are unavailable'));
    return new Promise((resolve, reject) => {
      const request = { ad, resolve, reject, phase: 'opening' };
      request.timer = setTimeout(() => {
        finish(request, false, new Error('TapTap rewarded ad timed out'));
      }, playbackTimeoutMs);
      pending = request;
      show(request);
    });
  }

  return { available, preload, play };
})();

window.breakfastRewardedVideo ??= breakfastTapAds;
