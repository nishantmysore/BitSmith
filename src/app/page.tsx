import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { ClientContent } from "./ClientContent"
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser()
   
  if (!user) {
    redirect('/login')
  }

  return (
    <main>
      <Header />
      <ClientContent />
    </main>
  );
}
