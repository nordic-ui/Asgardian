import { FC, PropsWithChildren } from "react";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";
import { Head } from "nextra/components";

import "nextra-theme-docs/style.css";

export const metadata = {
  title: "Asgardian",
  description: "Just a simple authorization library",
};

const navbar = (
  <Navbar logo={<img src="/logo.svg" alt="Asgardian" width="150" />} />
);
const footer = <Footer>MIT {new Date().getFullYear()} © Nordic-UI.</Footer>;

const RootLayout: FC<PropsWithChildren> = async ({ children }) => {
  const pageMap = await getPageMap();

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        {/* Your additional tags should be passed as `children` of `<Head>` element */}
        <meta property="og:image" content="/meta.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:image" content="/meta.png" />
        <meta name="twitter:image:type" content="image/png" />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="630" />
      </Head>

      <body>
        <Layout
          navbar={navbar}
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/nordic-ui/Asgardian/tree/main"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
};

export default RootLayout;
