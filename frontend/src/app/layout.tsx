import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "StellaAtlas",
    template: "%s | StellaAtlas",
  },
  description:
    "내 위치에서 오늘 밤 별을 보기 좋은 시간과 관측 조건을 알려드립니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
