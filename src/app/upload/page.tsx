import DeviceConfigUpload from "@/components/DeviceConfigUpload"
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation"

export default async function Page() {
  const user = await getCurrentUser()
   
  if (!user) {
    redirect('/login')
  }
  return <DeviceConfigUpload/>;
}
