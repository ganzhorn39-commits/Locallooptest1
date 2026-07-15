import { useRouter } from "expo-router";
import CreateEventScreen from "@/src/screens/CreateEventScreen";

export default function CreateTab() {
  const router = useRouter();
  return <CreateEventScreen onDone={() => router.push("/(tabs)/explore")} />;
}
