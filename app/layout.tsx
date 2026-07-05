import type { Metadata } from "next";
import { Cinzel, Noto_Serif_Thai, IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const serifThai = Noto_Serif_Thai({
  variable: "--font-serif-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sansThai = IBM_Plex_Sans_Thai({
  variable: "--font-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "บ้านร่มเย็น เรสซิเดนซ์ · ระบบหอพักและผู้เช่ารายเดือน",
  description:
    "หอพักคุณภาพใจกลางเมือง — จองห้อง จ่ายค่าเช่าออนไลน์ แจ้งซ่อม และดูแลผู้เช่าครบวงจรในระบบเดียว",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={`${cinzel.variable} ${serifThai.variable} ${sansThai.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <script
          // Apply persisted theme before paint to avoid flash of wrong theme.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=JSON.parse(localStorage.getItem('dorm-ui')||'{}');var t=(s&&s.state&&s.state.theme)||'light';if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
