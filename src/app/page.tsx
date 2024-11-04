import { Header } from "@/components/header"
import RegisterList from "@/components/RegisterList"
import RegisterBitViewer from "@/components/RegisterBitViewer"

export default function Home() {
  return (
    <main>
      <Header />
      <div className="flex flex-col p-4">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-4 items-start"> 
            <div className="col-span-1"> 
              <RegisterBitViewer />
            </div>
            <div className="col-span-2">
              <RegisterList />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
