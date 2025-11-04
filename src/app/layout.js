import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata = {
  title: "SmartGwiza - AI-Pcccowered Maize Yield Prediction",
  description:
    "SmartGwiza helps Rwandan farmers predict maize yields using AI technology, access expert knowledge, and improve farming practices.",
  icons: {
    icon: "/favicon.png",
    apple: "/smartgwizalogo.png",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}