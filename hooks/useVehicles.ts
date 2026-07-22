import { useCallback, useEffect, useState } from "react";
import { listVehicles } from "@/lib/db/queries/vehicles";
import type { Vehicle } from "@/lib/db/types";
import { useSession } from "@/lib/auth/SessionProvider";

export function useVehicles() {
  const { session } = useSession();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session?.user.id) {
      setVehicles([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const rows = await listVehicles(session.user.id);
    setVehicles(rows);
    setIsLoading(false);
  }, [session?.user.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { vehicles, isLoading, refresh };
}
