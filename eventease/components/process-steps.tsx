"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { motion, useInView, useAnimation } from "framer-motion"
import { CheckCircle, Code, Rocket } from "lucide-react"

interface Step {
  id: number
  title: string
  description: string
  icon: React.ReactNode
}

const steps: Step[] = [
  {
    id: 1,
    title: "Sign Up for ConnectX",
    description: "Create your account and get instant access to our dashboard. No credit card required to start.",
    icon: <CheckCircle className="h-8 w-8" />,
  },
  {
    id: 2,
    title: "Configure Your Store",
    description: "Set up your products, pricing, and payment methods using our intuitive dashboard or API.",
    icon: <Code className="h-8 w-8" />,
  },
  {
    id: 3,
    title: "Launch Your Business",
    description: "Connect your frontend to our API and start selling. We handle the backend complexity.",
    icon: <Rocket className="h-8 w-8" />,
  },
]

export function ProcessSteps() {
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, threshold: 0.2 })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  return (
    <div ref={ref} className="mx-auto max-w-4xl">
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-[#02569B] via-emerald-500 to-[#0288d1] md:left-1/2 md:-ml-0.5"></div>

        <div className="space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className="relative"
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, delay: index * 0.3 },
                },
              }}
            >
              <div className="flex flex-col items-center md:flex-row md:gap-8">
                <div className="flex md:w-1/2 md:justify-end md:pr-8">
                  {index % 2 === 0 ? (
                    <div className="relative z-10 md:text-right">
                      <motion.div
                        className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#02569B] to-[#0288d1] text-white"
                        initial={{ scale: 0 }}
                        animate={controls}
                        variants={{
                          hidden: { scale: 0 },
                          visible: {
                            scale: 1,
                            transition: { duration: 0.4, delay: index * 0.3 + 0.2 },
                          },
                        }}
                      >
                        {step.icon}
                      </motion.div>
                      <h3 className="text-xl font-bold">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  ) : (
                    <div className="hidden md:block" />
                  )}
                </div>

                <div className="absolute left-4 flex h-8 w-8 -translate-y-4 items-center justify-center rounded-full border-4 border-background bg-[#02569B] text-white md:left-1/2 md:-ml-4 md:translate-y-0">
                  {step.id}
                </div>

                <div className="pl-12 md:w-1/2 md:pl-8">
                  {index % 2 === 1 ? (
                    <div className="relative z-10">
                      <motion.div
                        className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#02569B] to-[#0288d1] text-white"
                        initial={{ scale: 0 }}
                        animate={controls}
                        variants={{
                          hidden: { scale: 0 },
                          visible: {
                            scale: 1,
                            transition: { duration: 0.4, delay: index * 0.3 + 0.2 },
                          },
                        }}
                      >
                        {step.icon}
                      </motion.div>
                      <h3 className="text-xl font-bold">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  ) : (
                    <div className="block md:hidden">
                      <h3 className="text-xl font-bold">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
