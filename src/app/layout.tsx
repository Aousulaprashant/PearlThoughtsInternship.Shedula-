import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { UserProvider } from "@/context/UseContext-login";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Shedula - Book Your Doctor",
  description: "Doctor appointment platform for easy healthcare access.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts Preconnect and Stylesheet */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Toaster
          position="top-center"
          toastOptions={{ style: { zIndex: 9999 } }}
        />
        <UserProvider>
          <Header />
          <main className="flex-1 container m-0">{children}</main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
