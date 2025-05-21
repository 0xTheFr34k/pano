import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information Skeleton */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar and Name */}
              <div className="flex flex-col items-center text-center">
                <Skeleton className="h-24 w-24 rounded-full mb-4" />
                <Skeleton className="h-6 w-40" />
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <Skeleton className="h-5 w-5 mr-3" />
                  <div className="w-full">
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                </div>
                <div className="flex items-center">
                  <Skeleton className="h-5 w-5 mr-3" />
                  <div className="w-full">
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                </div>
              </div>

              {/* Game Preferences */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-40" />
                <div className="flex items-center">
                  <Skeleton className="h-8 w-8 rounded-full mr-3" />
                  <div className="w-full">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </div>
                <div className="flex items-center">
                  <Skeleton className="h-8 w-8 rounded-full mr-3" />
                  <div className="w-full">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center">
                <Skeleton className="h-5 w-5 mr-3" />
                <div className="w-full">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-5 w-40" />
                </div>
              </div>
            </CardContent>
            <div className="p-6 pt-0">
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>

          {/* Reservations Skeleton */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="border-l-4 border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="w-full sm:w-2/3">
                            <div className="flex items-center mb-2">
                              <Skeleton className="h-5 w-5 mr-2" />
                              <Skeleton className="h-5 w-24 mr-2" />
                              <Skeleton className="h-5 w-16" />
                            </div>
                            <Skeleton className="h-4 w-full mb-1" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <div className="flex gap-2">
                            <Skeleton className="h-9 w-24" />
                            <Skeleton className="h-9 w-24" />
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
