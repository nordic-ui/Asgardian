import nextra from "nextra";

const withNextra = nextra({
  contentDirBasePath: "/",
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextra(nextConfig);
