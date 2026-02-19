import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design System Playground",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-surface-main">{children}</div>;
}
