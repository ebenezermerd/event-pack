import type { SidebarNavItem } from "@/types/nav"

export const docsConfig: { sidebarNav: SidebarNavItem[] } = {
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Introduction",
          href: "/docs",
        },
        {
          title: "Installation",
          href: "/docs/installation",
        },
        {
          title: "Quickstart",
          href: "/docs/quickstart",
        },
      ],
    },
    {
      title: "Authentication",
      items: [
        {
          title: "Overview",
          href: "/docs/authentication/overview",
        },
        {
          title: "API Keys",
          href: "/docs/authentication/api-keys",
        },
        {
          title: "OAuth",
          href: "/docs/authentication/oauth",
        },
      ],
    },
    {
      title: "Product APIs",
      items: [
        {
          title: "Overview",
          href: "/docs/products/overview",
        },
        {
          title: "Create Products",
          href: "/docs/products/create",
        },
        {
          title: "Retrieve Products",
          href: "/docs/products/retrieve",
        },
        {
          title: "Update Products",
          href: "/docs/products/update",
        },
        {
          title: "Delete Products",
          href: "/docs/products/delete",
        },
      ],
    },
    {
      title: "Order APIs",
      items: [
        {
          title: "Overview",
          href: "/docs/orders/overview",
        },
        {
          title: "Create Orders",
          href: "/docs/orders/create",
        },
        {
          title: "Retrieve Orders",
          href: "/docs/orders/retrieve",
        },
        {
          title: "Update Orders",
          href: "/docs/orders/update",
        },
      ],
    },
    {
      title: "Payment Integration",
      items: [
        {
          title: "Overview",
          href: "/docs/payments/overview",
        },
        {
          title: "Stripe",
          href: "/docs/payments/stripe",
        },
        {
          title: "PayPal",
          href: "/docs/payments/paypal",
        },
        {
          title: "Chapa",
          href: "/docs/payments/chapa",
        },
      ],
    },
    {
      title: "Error Handling",
      items: [
        {
          title: "Overview",
          href: "/docs/errors/overview",
        },
        {
          title: "Common Errors",
          href: "/docs/errors/common-errors",
        },
        {
          title: "Best Practices",
          href: "/docs/errors/best-practices",
        },
      ],
    },
  ],
}
