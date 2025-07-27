"use client";

import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/switch";
import { Check, X } from "lucide-react";
import { useState } from "react";

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Free",
      price: {
        monthly: 0,
        yearly: 0,
      },
      features: [
        { name: "5 clients, 10 quotes", included: true },
        { name: "Manual only invoices", included: true },
        { name: "Basic PDFs", included: false },
        { name: "Client Portal", included: false },
        { name: "Advanced Analytics", included: false },
        { name: "Full branding + domain", included: false },
        { name: "Team Members", included: false },
        { name: "API Access", included: false },
        { name: "Priority Support", included: false },
      ],
      cta: "Start for Free",
    },
    {
      name: "Pro",
      price: {
        monthly: 19,
        yearly: 190,
      },
      features: [
        { name: "Unlimited clients and quotes", included: true },
        { name: "Stripe Payments", included: true },
        { name: "Basic PDFs", included: true },
        { name: "Client Portal", included: false },
        { name: "Advanced Analytics", included: false },
        { name: "Full branding + domain", included: true },
        { name: "Team Members", included: false },
        { name: "API Access", included: false },
        { name: "Priority Support", included: false },
      ],
      cta: "Try Pro",
    },
    {
      name: "Business",
      price: {
        monthly: 49,
        yearly: 490,
      },
      features: [
        { name: "Unlimited clients and quotes", included: true },
        { name: "Stripe + ACH", included: true },
        { name_linked: { name: "Branded PDFs + Email", href: "/blog/branded-pdfs" }, included: true },
        { name: "Client Portal", included: true },
        { name: "Advanced Analytics", included: true },
        { name: "Full branding + domain", included: true },
        { name: "3 users", included: true },
        { name: "API Access", included: true },
        { name: "Priority Support", included: true },
      ],
      cta: "Get Business Plan",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold">Pricing</h1>
      <p className="text-xl mt-4">
        Choose the plan that's right for your business.
      </p>
      <div className="flex items-center mt-8">
        <span>Monthly</span>
        <Switch
          checked={isYearly}
          onCheckedChange={() => setIsYearly(!isYearly)}
          className="mx-4"
        />
        <span>Yearly (Save 10%)</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        {plans.map((plan) => (
          <div key={plan.name} className="p-8 border rounded-lg">
            <h2 className="text-3xl font-bold">{plan.name}</h2>
            <p className="text-xl mt-4">
              $
              {isYearly
                ? plan.price.yearly / 12
                : plan.price.monthly}
              /month
            </p>
            <ul className="mt-8 space-y-4">
              {plan.features.map((feature) => (
                <li key={feature.name || feature.name_linked.name} className="flex items-center">
                  {feature.included ? (
                    <Check className="w-6 h-6 text-green-500" />
                  ) : (
                    <X className="w-6 h-6 text-red-500" />
                  )}
                  <span className="ml-4">{feature.name || feature.name_linked.name}</span>
                </li>
              ))}
            </ul>
            <Button className="mt-8 w-full">{plan.cta}</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing; 