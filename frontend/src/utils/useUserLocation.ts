import { useCallback, useEffect, useState } from "react";
import * as Location from "expo-location";

export function useUserLocation() {
  const [userLoc, setUserLoc] = useState<{ latitude: number; longitude: number } | null>(null);

  const requestLocation = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      let granted = status === "granted";
      if (!granted) {
        const res = await Location.requestForegroundPermissionsAsync();
        granted = res.status === "granted";
      }
      if (!granted) return;
      const loc = await Location.getCurrentPositionAsync({});
      setUserLoc({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch {}
  }, []);

  useEffect(() => { requestLocation(); }, [requestLocation]);

  return { userLoc, requestLocation };
}
