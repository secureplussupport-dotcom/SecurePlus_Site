// A navigation request launches once, even when React re-runs its effect as
// generation starts/finishes. A newer request waits while generation is busy.
export function createReviewLaunchGate() {
  let consumed = null;
  return (request, busy) => {
    if (!request?.chapterId || !request.nonce || busy) return false;
    const key = JSON.stringify([request.chapterId, request.nonce]);
    if (key === consumed) return false;
    consumed = key;
    return true;
  };
}
