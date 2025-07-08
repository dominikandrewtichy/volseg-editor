import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type MarkdownViewerProps = {
  markdown: string;
};

export function MarkdownViewer({ markdown }: MarkdownViewerProps) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-2xl font-semibold mb-3">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-semibold mb-3">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold mb-3">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-base font-semibold mb-3">{children}</h4>
        ),
        h5: ({ children }) => (
          <h5 className="text-base font-semibold mb-3">{children}</h5>
        ),
        h6: ({ children }) => (
          <h6 className="text-base font-semibold mb-3">{children}</h6>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-blue-600 hover:underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>
        ),
        li: ({ children }) => <li className="text-base">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4">
            {children}
          </blockquote>
        ),
        code: ({ children }) => {
          return (
            <code className="bg-gray-900 p-1 py-0.5 rounded-sm">{children}</code>
          );
        },
        table: ({ children }) => (
          <table className="w-full border-collapse mb-4">{children}</table>
        ),
        thead: ({ children }) => (
          <thead className="bg-gray-100 text-left">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="border px-4 py-2 font-medium">{children}</th>
        ),
        td: ({ children }) => <td className="border px-4 py-2">{children}</td>,
        hr: () => <hr className="my-6 border-gray-300" />,
        img: ({ src, alt }) => (
          <img
            src={src ?? ""}
            alt={alt ?? ""}
            className="max-w-full my-4 rounded"
          />
        ),
        
      }}
    >
      {markdown}
    </Markdown>
  );
}
