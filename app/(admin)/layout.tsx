import type { Metadata } from "next";



export const metadata: Metadata = {
  title: "BabaBali Admin Panel",
  description: "Zaidi Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
          <html lang="en">
        <body>{children}</body>
      </html>
    
  );
}
