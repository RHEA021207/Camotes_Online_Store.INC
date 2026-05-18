"use client"

import { CreditCard, ShoppingBasket, Cookie, Smartphone, Tv, Warehouse } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ServicesGridProps {
  onSelectService: (service: string) => void
}

const services = [
  {
    id: "e-loan",
    title: "E-Loan",
    description: "Quick cash loans from 1k-10k. Kinsenas, Binuwan, or Senimana payment modes.",
    icon: CreditCard,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
  },
  {
    id: "bugas",
    title: "Bugas (Rice)",
    description: "Quality rice at P59.99/kg. Available in 5kl, 10kl, 25kl, and 50kl installments.",
    icon: ShoppingBasket,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
  },
  {
    id: "snacks",
    title: "Snacks",
    description: "Bodbod, Shakoy, Ubi Turon, Mango Float, Cookies & Cream, and Munchkins.",
    icon: Cookie,
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
  },
  {
    id: "gadgets",
    title: "Gadgets",
    description: "Vivo, Realme, Infinix, Redmi, Oppo, Tecno, Nubia. Pay Now or Pay Later options.",
    icon: Smartphone,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    id: "appliances",
    title: "Appliances",
    description: "Refrigerators, Washing Machines, TVs, and Speakers with flexible payments.",
    icon: Tv,
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
  },
  {
    id: "sangla",
    title: "Sangla/Prenda",
    description: "Pawn your Appliances, Gadgets, Motorcycles, or Cars for instant cash.",
    icon: Warehouse,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
  },
]

export function ServicesGrid({ onSelectService }: ServicesGridProps) {
  return (
    <section className="py-12 bg-[#293241]" id="services">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-[#e0fbfc] text-center mb-2">
          Available Services
        </h2>
        <p className="text-[#98c1d9] text-center mb-8">
          Choose from our wide range of microfinance and retail services
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <Card
                key={service.id}
                className="bg-[#3d5a80] border-[#98c1d9]/30 hover:border-[#98c1d9] transition-all cursor-pointer group hover:shadow-lg hover:shadow-[#98c1d9]/10 hover:-translate-y-1"
                onClick={() => onSelectService(service.id)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${service.bgColor} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 ${service.color}`} />
                  </div>
                  <CardTitle className="text-[#e0fbfc]">{service.title}</CardTitle>
                  <CardDescription className="text-[#98c1d9]">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-[#ee6c4d] font-medium group-hover:underline">
                    View Details &rarr;
                  </span>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
