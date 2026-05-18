import { hasExpertAccessSession } from "@/lib/expert-session";
import { redirect } from "next/navigation";

export default async function ExpertIndexPage() {
  if (await hasExpertAccessSession()) {
    redirect("/expert/queue");
  }
  redirect("/expert/login");
}
