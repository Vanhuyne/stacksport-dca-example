import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "StacksPort DCA Dashboard",
  description:
    "Live stats for StacksPort DCA vaults on Stacks mainnet, powered by @stacksport/dca-sdk.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
