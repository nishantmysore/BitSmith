import { ModeToggle } from "@/components/ModeToggle"

export function Header() {
  return (
    <div className="w-full border-b">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto justify-between">
        <div className="text-2xl font-bold">BitSmith</div>
        <ModeToggle />
      </div>
    </div>
  )
}
