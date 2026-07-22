import { useCallback, useEffect, useState } from "react";
import { listDrivers } from "@/lib/db/queries/drivers";
import type { Driver } from "@/lib/db/types";
import { useSession } from "@/lib/auth/SessionProvider";

export function useDrivers() {
  const { session } = useSession();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session?.user.id) {
      setDrivers([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const rows = await listDrivers(session.user.id);
    setDrivers(rows);
    setIsLoading(false);
  }, [session?.user.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { drivers, isLoading, refresh };
}
