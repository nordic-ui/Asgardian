import { FC, PropsWithChildren } from "react";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";
import { Head } from "nextra/components";

import "nextra-theme-docs/style.css";

export const metadata = {
  title: "Asgardian",
  description: "Just a simple authorization library",
};

const navbar = <Navbar logo={<b>Asgardian</b>} />;
const footer = <Footer>MIT {new Date().getFullYear()} © Nordic-UI.</Footer>;

const RootLayout: FC<PropsWithChildren> = async ({ children }) => {
  const pageMap = await getPageMap();

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        {/* Your additional tags should be passed as `children` of `<Head>` element */}
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
