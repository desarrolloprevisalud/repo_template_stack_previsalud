import React from "react";

import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import themeConfig from "@/theme/themeConfig";
import es_ES from "antd/locale/es_ES";
import { Providers } from "@/redux/providers";
import "./globals.css";
// import "@ant-design/v5-patch-for-react-19";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fenix",
  description: "Aplicativo de prueba tecnica",
  icons: {
    icon: "/favicon.ico",
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AntdRegistry>
          <ConfigProvider theme={themeConfig} locale={es_ES}>
            <Providers>
              <main className="container-main-app">{children}</main>
            </Providers>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
};

export default RootLayout;
