'use strict';

const breakfastLeaderboard = (() => {
  const leaderboardId = 'ehdxw6irucw7l09fa3';
  const collection = 'public';

  function manager() {
    return window.tap?.getLeaderboardManager?.();
  }

  function available() {
    try {
      return typeof manager()?.loadLeaderboardScores === 'function';
    } catch {
      return false;
    }
  }

  function request(method, params, timeout = 10000) {
    return platformCall(() => new Promise((resolve, reject) => {
      const sdk = manager();
      if (typeof sdk?.[method] !== 'function') {
        reject(new Error('TapTap leaderboard is unavailable'));
        return;
      }
      sdk[method]({
        ...params,
        callback: {
          onSuccess: resolve,
          onFailure: (code, message) => reject(new Error('TapTap leaderboard ' + code + ': ' + (message || 'request failed'))),
        },
      });
    }), timeout);
  }

  function submit(score) {
    return request('submitScores', { scores: [{ leaderboardId, score }] }).then(result => {
      const best = result?.results?.find(item => item.leaderboardId === leaderboardId)?.scoreResult?.rawScore;
      if (!Number.isFinite(best) || best < score) throw new Error('TapTap did not confirm the submitted score');
      return best;
    });
  }

  function list() {
    return request('loadLeaderboardScores', { leaderboardId, collection, maxSize: 20 }).then(result => {
      if (!Array.isArray(result?.scores)) throw new Error('TapTap returned no score list');
      return result.scores;
    });
  }

  function personal() {
    return request('loadCurrentPlayerLeaderboardScore', { leaderboardId, collection })
      .then(result => result?.currentUserScore ?? null);
  }

  function open() {
    return request('openLeaderboard', { leaderboardId, collection });
  }

  return { available, submit, list, personal, open };
})();
