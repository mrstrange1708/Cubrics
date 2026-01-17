import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer } from "react-toastify";
import { Toaster } from "sonner";
import "react-toastify/dist/ReactToastify.css";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  icons: {
    icon: '/logo.png',
  },
  title: "Cubrics",
  description: "The ultimate platform for cube solvers. Algorithmic thinking meets premium design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-blue-500/30`}
      >
        <Providers>
          {children}
        </Providers>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: '#111',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#fff',
            },
            classNames: {
              success: 'border-blue-500/50 bg-blue-950/50',
              error: 'border-red-500/50',
            },
          }}
        />
      </body>
    </html>
  );
}
