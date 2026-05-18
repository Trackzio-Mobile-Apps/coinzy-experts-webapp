import { ExpertProfileScreen } from "@/components/expert/ExpertProfileScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My profile",
};

export default function ExpertProfilePage() {
  return <ExpertProfileScreen />;
}
