import { Header } from "@/components/header"
import RegisterVisualizer from "@/components/RegisterVisualizer"

export default function Home() {
  return (
    <main>
      <Header />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
        <RegisterVisualizer/>
      </div>
    </main>
  )
}
