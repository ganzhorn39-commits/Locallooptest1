import ProfileScreen from "@/src/screens/ProfileScreen";
import GuestGate from "@/src/components/GuestGate";
import { useAuth } from "@/src/auth/AuthContext";
import { useI18n } from "@/src/i18n";

export default function ProfileTab() {
  const { user } = useAuth();
  const { t } = useI18n();
  if (!user) return <GuestGate icon="person-outline" message={t("guest_profile")} />;
  return <ProfileScreen />;
}
