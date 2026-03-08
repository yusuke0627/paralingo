import { describe, expect, it } from 'vitest';
import { DEFAULT_REVIEW_STATUS_FILTER, toggleReviewStatusFilter } from './reviewFilter';

describe('review status filter', () => {
  it('starts unselected and toggles pending/resolved on and off', () => {
    expect(DEFAULT_REVIEW_STATUS_FILTER).toBeNull();

    const pending = toggleReviewStatusFilter(null, 'pending');
    expect(pending).toBe('pending');

    const pendingOff = toggleReviewStatusFilter(pending, 'pending');
    expect(pendingOff).toBeNull();

    const resolved = toggleReviewStatusFilter(null, 'resolved');
    expect(resolved).toBe('resolved');

    const switchToPending = toggleReviewStatusFilter(resolved, 'pending');
    expect(switchToPending).toBe('pending');
  });
});
