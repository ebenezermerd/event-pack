import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TemplatesPage() {
  return (
    <div className="container py-10 space-y-10">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Templates</h1>
        <p className="text-xl text-muted-foreground max-w-[700px] mx-auto">
          Ready-to-use templates to help you get started with ConnectX quickly.
        </p>
      </div>

      <Tabs defaultValue="web" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList>
            <TabsTrigger value="web">Web Templates</TabsTrigger>
            <TabsTrigger value="mobile">Mobile Templates</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="web" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "E-Commerce Starter", category: "Online Store", image: "ecommerce" },
              { name: "Admin Dashboard", category: "Management", image: "dashboard" },
              { name: "Landing Page", category: "Marketing", image: "landing" },
              { name: "Blog Platform", category: "Content", image: "blog" },
              { name: "Marketplace", category: "Multi-vendor", image: "marketplace" },
              { name: "Subscription Service", category: "SaaS", image: "subscription" },
            ].map((template, i) => (
              <div
                key={i}
                className="group rounded-lg border overflow-hidden bg-background transition-all hover:shadow-md"
              >
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src={`/placeholder.svg?height=300&width=500&text=${template.image}`}
                    alt={template.name}
                    width={500}
                    height={300}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <Button className="bg-[#02569B] hover:bg-[#02569B]/90">Preview</Button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-sm text-muted-foreground">{template.category}</div>
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-muted-foreground">Free</div>
                    <Link href="#">
                      <Button variant="outline" size="sm">
                        Use Template
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button className="bg-[#02569B] hover:bg-[#02569B]/90">View All Web Templates</Button>
          </div>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Mobile Shop", category: "E-Commerce", image: "mobile-shop" },
              { name: "Product Catalog", category: "Showcase", image: "catalog" },
              { name: "Order Tracking", category: "Logistics", image: "tracking" },
              { name: "Mobile Checkout", category: "Payment", image: "checkout" },
              { name: "User Profile", category: "Account", image: "profile" },
              { name: "Push Notifications", category: "Engagement", image: "notifications" },
            ].map((template, i) => (
              <div
                key={i}
                className="group rounded-lg border overflow-hidden bg-background transition-all hover:shadow-md"
              >
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src={`/placeholder.svg?height=300&width=500&text=${template.image}`}
                    alt={template.name}
                    width={500}
                    height={300}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <Button className="bg-[#02569B] hover:bg-[#02569B]/90">Preview</Button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-sm text-muted-foreground">{template.category}</div>
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-muted-foreground">Free</div>
                    <Link href="#">
                      <Button variant="outline" size="sm">
                        Use Template
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button className="bg-[#02569B] hover:bg-[#02569B]/90">View All Mobile Templates</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
