"use client"

import { Warehouse, AlertTriangle, Smartphone, Tv, Car, Bike, ArrowLeft, MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SanglaSectionProps {
  onBack?: () => void
  isFullPage?: boolean
}

const pawnable = [
  {
    id: "appliances",
    title: "Appliances",
    icon: Tv,
    description: "Refrigerators, Washing Machines, TVs, Air Conditioners",
    estimate: "Up to 50% of market value",
  },
  {
    id: "gadgets",
    title: "Gadgets",
    icon: Smartphone,
    description: "Smartphones, Laptops, Tablets, Cameras",
    estimate: "Up to 60% of market value",
  },
  {
    id: "motorcycles",
    title: "Motorcycles",
    icon: Bike,
    description: "All brands with complete documents (OR/CR)",
    estimate: "Based on current market value",
  },
  {
    id: "cars",
    title: "Cars",
    icon: Car,
    description: "All brands with complete documents (OR/CR)",
    estimate: "Based on current market value",
  },
]

export function SanglaSection({ onBack, isFullPage = false }: SanglaSectionProps) {
  return (
    <section className={`py-12 bg-[#3d5a80]/30 ${isFullPage ? 'min-h-screen' : ''}`} id="sangla">
      <div className="container mx-auto px-4">
        {isFullPage && onBack && (
          <Button
            variant="ghost"
            className="text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-[#3d5a80] mb-6"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Button>
        )}
        <div className="flex items-center gap-3 justify-center mb-2">
          <Warehouse className="h-8 w-8 text-orange-400" />
          <h2 className="text-3xl font-bold text-[#e0fbfc]">Sangla/Prenda</h2>
        </div>
        <p className="text-[#98c1d9] text-center mb-8">
          Get instant cash by pawning your valuables
        </p>

        {/* Disclaimer */}
        <div className="max-w-2xl mx-auto mb-8">
          <Card className="bg-yellow-500/10 border-yellow-500/30">
            <CardContent className="flex items-start gap-4 py-4">
              <AlertTriangle className="h-6 w-6 text-yellow-400 shrink-0 mt-1" />
              <div>
                <p className="text-yellow-400 font-semibold mb-1">Important Notice</p>
                <p className="text-[#e0fbfc] text-sm">
                  Physical store visit required for deal finalization. Please bring the item 
                  along with valid ID and any relevant documents (OR/CR for vehicles).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pawnable Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {pawnable.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.id} className="bg-[#3d5a80] border-[#98c1d9]/30 hover:border-[#98c1d9] transition-all">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 rounded-full bg-orange-400/10 flex items-center justify-center mx-auto mb-2">
                    <Icon className="h-8 w-8 text-orange-400" />
                  </div>
                  <CardTitle className="text-[#e0fbfc]">{item.title}</CardTitle>
                  <CardDescription className="text-[#98c1d9]">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-[#ee6c4d] font-medium">
                    {item.estimate}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Multi-Channel CTA Unit */}
        <div className="mt-10 flex flex-col items-center justify-center text-center">
          {/* Primary Call-to-Action */}
          <a
            href="https://m.me/1BcP1N5D2S"
            target="_blank"
            rel="noopener noreferrer"
            className="transform transition-transform active:scale-95"
          >
            <Button className="bg-[#ee6c4d] hover:bg-[#d65a31] text-white font-bold px-8 py-6 rounded-xl text-sm shadow-md transition-all">
              Message Us to Get a Quote
            </Button>
          </a>
          
          <p className="text-[#98c1d9] text-xs mt-2.5">
            Send photos of your item via Facebook Messenger for a quick estimate
          </p>

          {/* Contextual Separator */}
          <div className="my-4 flex items-center justify-center gap-3 w-full max-w-xs">
            <div className="h-[1px] bg-[#3d5a80]/40 flex-1" />
            <span className="text-xs font-bold text-[#98c1d9]/40 tracking-wider uppercase">or</span>
            <div className="h-[1px] bg-[#3d5a80]/40 flex-1" />
          </div>

          {/* Secondary Store Navigation Link */}
          <a
            href="https://maps.app.goo.gl/mLWstJ2MiycruaWC9"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#3d5a80]/60 bg-[#1e2530]/30 text-sm text-[#e0fbfc] hover:text-[#ee6c4d] hover:border-[#ee6c4d]/60 shadow-sm transition-all duration-300"
          >
            <MapPin className="h-4 w-4 text-[#98c1d9] group-hover:text-[#ee6c4d] transition-colors" />
            <span className="font-semibold underline underline-offset-4 decoration-[#3d5a80]/60 group-hover:decoration-[#ee6c4d]/60 transition-colors">
              Visit us at our physical store
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}