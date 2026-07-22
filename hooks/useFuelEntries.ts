import { useCallback, useEffect, useState } from "react";
import { listFuelEntries, type FuelFilters } from "@/lib/db/queries/fuelEntries";
import type { FuelEntry } from "@/lib/db/types";
import { useSession } from "@/lib/auth/SessionProvider";
import { useFuelVersionStore } from "@/lib/state/fuelStore";

export function useFuelEntries(filters: FuelFilters = {}) {
  const { session } = useSession();
  const version = useFuelVersionStore((s) => s.version);
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const filterKey = JSON.stringify(filters);

  const refresh = useCallback(async () => {
    if (!session?.user.id) {
      setFuelEntries([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const rows = await listFuelEntries(session.user.id, filters);
    setFuelEntries(rows);
    setIsLoading(false);
    // filters is captured via filterKey below to avoid an infinite effect loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id, filterKey]);

  useEffect(() => {
    refresh();
  }, [refresh, version]);

  return { fuelEntries, isLoading, refresh };
}
