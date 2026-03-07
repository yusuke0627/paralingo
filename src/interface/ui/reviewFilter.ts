import { ReviewStatus } from '../../domain/entities';

export type ReviewStatusFilter = ReviewStatus | null;

export const DEFAULT_REVIEW_STATUS_FILTER: ReviewStatusFilter = null;

export const toggleReviewStatusFilter = (
  current: ReviewStatusFilter,
  selected: ReviewStatus
): ReviewStatusFilter => {
  return current === selected ? null : selected;
};
