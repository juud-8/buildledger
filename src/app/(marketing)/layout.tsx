import { Navigation } from "@/components/Navigation";
import { PropsWithChildren } from "react";

const MarketingLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default MarketingLayout; 