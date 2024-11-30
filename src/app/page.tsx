import { redirect } from "next/navigation";
import { ClientContent } from "./ClientContent";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
      <main className="flex-1">
        <ClientContent />
      </main>
  );
}
