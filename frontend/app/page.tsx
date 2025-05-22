import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Users, Clock, ShieldCheck } from "lucide-react"
import { GameCard } from "@/components/game-card"
import { OperationalHours } from "@/components/operational-hours"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[70vh] md:h-[80vh] flex items-center">
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                backgroundBlendMode: "overlay",
              }}
            />
            {/* Moroccan pattern overlay */}
            <div
              className="absolute inset-0 opacity-10 bg-repeat"
              style={{
                backgroundImage: "url('/placeholder.svg?height=200&width=200')",
                backgroundSize: "100px",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950/80 to-transparent"></div>
          </div>

          <div className="container mx-auto px-4 z-10 text-white">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="text-amber-400">Panorama</span> Gaming Club
              </h1>
              <p className="text-xl md:text-2xl mb-2 text-gray-200">Morocco's Premier Gaming Experience</p>
              <p className="text-lg md:text-xl mb-8 max-w-2xl">
                Enjoy pool, snooker, and next-gen PS5 experiences — reserve your station instantly or find opponents for
                competitive matches.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Link href="/reserve">
                    Book a Game <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10 bg-blue-900/50"
                >
                  <Link href="/register">
                    <ShieldCheck className="mr-2 h-5 w-5" /> Register
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gradient-to-b from-blue-900 to-blue-950">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">Our Gaming Experiences</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <GameCard
                title="Pool Tables"
                description="Professional 8-ball pool tables for casual games or competitive matches."
                icon="🎱"
                href="/reserve?type=pool"
              />
              <GameCard
                title="Snooker"
                description="Full-size snooker tables maintained to tournament standards."
                icon="🎯"
                href="/reserve?type=snooker"
              />
              <GameCard
                title="PS5 Gaming"
                description="Next-gen console gaming with the latest titles and comfortable seating."
                icon="🎮"
                href="/reserve?type=ps5"
              />
            </div>
          </div>
        </section>

        {/* Moroccan-Inspired Design Element */}
        <div className="h-16 bg-gradient-to-r from-blue-900 via-amber-500 to-blue-900 opacity-90 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-30 bg-repeat"
            style={{
              backgroundImage: "url('/placeholder.svg?height=100&width=100')",
              backgroundSize: "50px",
            }}
          />
        </div>

        {/* How It Works */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-blue-900">How It Works</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  title: "Register",
                  description: "Create your member account to access all features and benefits.",
                  icon: <ShieldCheck className="h-10 w-10 text-blue-900" />,
                },
                {
                  title: "Book Your Station",
                  description: "Choose your game type, time, and duration. Confirm your booking instantly.",
                  icon: <Calendar className="h-10 w-10 text-blue-900" />,
                },
                {
                  title: "Find Opponents",
                  description: "Looking for someone to play with? Find other members waiting for a match.",
                  icon: <Users className="h-10 w-10 text-blue-900" />,
                },
                {
                  title: "Check Availability",
                  description: "See which stations are available during our opening hours (2 PM - 12 AM).",
                  icon: <Clock className="h-10 w-10 text-blue-900" />,
                },
              ].map((feature, index) => (
                <div key={index} className="bg-blue-50 rounded-xl p-8 text-center hover:shadow-lg transition-all">
                  <div className="mx-auto w-16 h-16 flex items-center justify-center mb-4 bg-white rounded-full shadow-sm">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-blue-900">{feature.title}</h3>
                  <p className="text-gray-700">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 bg-blue-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <div className="rounded-xl overflow-hidden h-[300px] md:h-[400px] bg-gray-200 relative">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: "url('/placeholder.svg?height=800&width=1200')" }}
                  />
                  {/* Moroccan-style decorative corner */}
                  <div className="absolute top-0 left-0 w-16 h-16 bg-amber-500 opacity-80 rounded-br-3xl"></div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-blue-900 opacity-80 rounded-tl-3xl"></div>
                </div>
                <div className="mt-6">
                  <OperationalHours />
                </div>
              </div>
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-4 text-blue-900">About Panorama</h2>
                <p className="text-gray-700 mb-4">
                  Panorama Gaming Club offers a premium gaming experience in the heart of Morocco. Our club features 1
                  PS5 console, 4 pool tables (8-ball), and 1 snooker table. We're open daily from14:30 PM to 00:00 AM.
                </p>
                <p className="text-gray-700 mb-6">
                  Whether you're looking to challenge friends to a game of pool, perfect your snooker skills, or enjoy
                  the latest PS5 games, Panorama provides the perfect atmosphere for all gaming enthusiasts.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild className="bg-blue-900 hover:bg-blue-800">
                    <Link href="/reserve">Make a Reservation</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-blue-900 text-blue-900">
                    <Link href="/register">Become a Member</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Member Benefits */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-blue-900">Member Benefits</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Priority Bookings",
                  description: "Members get priority access to peak hours and special events.",
                },
                {
                  title: "Discounted Rates",
                  description: "Enjoy special pricing on all gaming sessions and refreshments.",
                },
                {
                  title: "Tournament Access",
                  description: "Participate in exclusive member-only tournaments and competitions.",
                },
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="border border-amber-200 bg-amber-50 rounded-xl p-6 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-blue-900">{benefit.title}</h3>
                  <p className="text-gray-700">{benefit.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600">
                <Link href="/register">Register Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-blue-950 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold">Panorama</h2>
              <p className="text-gray-300">Premium Gaming Experience</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-300">© 2025 Panorama Gaming Club. All rights reserved.</p>
              <p className="text-gray-400">Located in the heart of Morocco</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
