import { generateStaticParamsFor, importPage } from "nextra/pages";

import { useMDXComponents as getMDXComponents } from "../../mdx-components";

export const generateStaticParams = generateStaticParamsFor("mdxPath");

export const generateMetadata = async (props) => {
  const params = await props.params;

  const { metadata } = await importPage(params.mdxPath);

  return metadata;
};

const Wrapper = getMDXComponents({}).wrapper;

const Page = async (props) => {
  const params = await props.params;
  const result = await importPage(params.mdxPath);

  const { default: MDXContent, toc, metadata } = result;

  return (
    <Wrapper toc={toc} metadata={metadata}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  );
};

export default Page;
