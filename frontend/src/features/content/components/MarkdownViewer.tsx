import { useMemo } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeReact from "rehype-react";
import rehypeSanitize from "rehype-sanitize";
import parse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import {
  rehypeActionHandler,
  remarkActionSyntax,
} from "../lib/remarkActionSyntax";
import { HastToJsxComponents } from "./RehypeToJsxComponents";
import { defaultSchema } from "hast-util-sanitize";

export type MarkdownViewerProps = {
  markdown: string;
};

export function MarkdownViewer({ markdown }: MarkdownViewerProps) {
  const Content = useMemo(() => {
    const processor = unified()
      .use(parse)
      .use(remarkActionSyntax)
      // TODO: remove autolinks
      .use(remarkRehype, { passThrough: ["action"] })
      .use(rehypeActionHandler)
      .use(rehypeReact, {
        Fragment,
        jsx,
        jsxs,
        passNode: true,
        elementAttributeNameCase: "react",
        components: HastToJsxComponents,
      })
      .use(rehypeSanitize, {
        ...defaultSchema,
        tagNames: [...(defaultSchema.tagNames ?? []), "action-tag"],
      });

    const result = processor.processSync(markdown);
    return result.result as React.ReactElement;
  }, [markdown]);

  return <>{Content}</>;
}
