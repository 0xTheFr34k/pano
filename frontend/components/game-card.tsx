import Link from "next/link"
import { CustomButton } from "@/components/custom-button"
import { ArrowRight } from "lucide-react"

interface GameCardProps {
  title: string
  description: string
  icon: string
  href: string
}

export function GameCard({ title, description, icon, href }: GameCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white hover:bg-white/15 transition-all">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-300 mb-4">{description}</p>
      <CustomButton asChild variant="outline" className="border-white text-white hover:bg-white/10 bg-blue-900/50 font-bold">
        <Link href={href} className="text-white">
          Book Now <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </CustomButton>
    </div>
  )
}
