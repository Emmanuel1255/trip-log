import { useCallback, useEffect, useState } from "react";
import { listTrips, type TripFilters } from "@/lib/db/queries/trips";
import type { Trip } from "@/lib/db/types";
import { useSession } from "@/lib/auth/SessionProvider";
import { useTripsVersionStore } from "@/lib/state/tripsStore";

export function useTrips(filters: TripFilters = {}) {
  const { session } = useSession();
  const version = useTripsVersionStore((s) => s.version);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const filterKey = JSON.stringify(filters);

  const refresh = useCallback(async () => {
    if (!session?.user.id) {
      setTrips([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const rows = await listTrips(session.user.id, filters);
    setTrips(rows);
    setIsLoading(false);
    // filters is captured via filterKey below to avoid an infinite effect loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id, filterKey]);

  useEffect(() => {
    refresh();
  }, [refresh, version]);

  return { trips, isLoading, refresh };
}
