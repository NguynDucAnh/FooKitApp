import { useCallback, useMemo, useState } from 'react';

export type AdminDataSection = 'overview' | 'users' | 'plans' | 'affiliate' | 'usage';

type PendingCounts = Record<AdminDataSection, number>;
type SectionLoadingState = Record<AdminDataSection, boolean>;

const INITIAL_PENDING_COUNTS: PendingCounts = {
  overview: 0,
  users: 0,
  plans: 0,
  affiliate: 0,
  usage: 0,
};

export function useAdminSectionLoading() {
  const [pendingCounts, setPendingCounts] = useState<PendingCounts>(INITIAL_PENDING_COUNTS);

  const runWithSectionLoading = useCallback(
    async function withSectionLoading<T>(
      section: AdminDataSection,
      task: () => Promise<T>,
    ): Promise<T> {
      setPendingCounts(current => ({
        ...current,
        [section]: current[section] + 1,
      }));

      try {
        return await task();
      } finally {
        setPendingCounts(current => ({
          ...current,
          [section]: Math.max(0, current[section] - 1),
        }));
      }
    },
    [],
  );

  const loadingBySection = useMemo<SectionLoadingState>(() => ({
    overview: pendingCounts.overview > 0,
    users: pendingCounts.users > 0,
    plans: pendingCounts.plans > 0,
    affiliate: pendingCounts.affiliate > 0,
    usage: pendingCounts.usage > 0,
  }), [pendingCounts]);

  return {
    loadingBySection,
    runWithSectionLoading,
  };
}
