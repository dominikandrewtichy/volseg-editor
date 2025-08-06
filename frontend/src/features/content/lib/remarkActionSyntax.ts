import type { Element, Root as HastRoot } from "hast";
import type { Root as MdastRoot, PhrasingContent } from "mdast";
import { findAndReplace } from "mdast-util-find-and-replace";
import { visit } from "unist-util-visit";

const ACTION_REGEX = /@\[([^\]]+)\]\[([^\]]+)\]/g;

function splitFunctionCalls(input: string): string[] {
  const calls: string[] = [];
  let depth = 0;
  let quote = false;
  let current = "";

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === '"' && input[i - 1] !== "\\") {
      quote = !quote;
    }

    if (!quote) {
      if (char === "(") depth++;
      else if (char === ")") depth--;
      else if (char === "," && depth === 0) {
        calls.push(current.trim());
        current = "";
        continue;
      }
    }

    current += char;
  }

  if (current.trim()) {
    calls.push(current.trim());
  }

  return calls;
}

export function remarkActionSyntax() {
  return (tree: MdastRoot) => {
    findAndReplace(tree, [
      ACTION_REGEX,
      (_, label: string, rawActions: string) => {
        const calls = splitFunctionCalls(rawActions);
        const actions = calls
          .map((call) => {
            const match = /^([a-zA-Z0-9_]+)\((.*)\)$/.exec(call);
            if (!match) return null;

            const [, name, rawParams] = match;
            if (!rawParams) return null;

            // Split parameters, preserving quoted strings
            const params = splitFunctionCalls(rawParams).map((p) => {
              const trimmed = p.trim();
              // Try to parse number or boolean or leave as string
              try {
                return JSON.parse(trimmed);
              } catch {
                return trimmed;
              }
            });

            return { name, parameters: params };
          })
          .filter(Boolean);

        return {
          type: "action",
          data: { label, actions },
        } as PhrasingContent;
      },
    ]);
  };
}

export function logNodes() {
  return (tree: MdastRoot | HastRoot) => {
    visit(tree, function (node) {
      console.log(JSON.stringify(node, null, 2));
    });
  };
}

export function rehypeActionHandler() {
  return (tree: HastRoot) => {
    visit(tree, (node: any, index, parent) => {
      if (node.type === "action") {
        const { label, actions } = node.data;

        const actionNode: Element = {
          type: "element",
          tagName: "action-tag",
          properties: {},
          children: [{ type: "text", value: "Run " + (node.data?.name ?? "") }],
          data: {
            actions,
            label,
          },
        };

        if (parent && typeof index === "number") {
          parent.children[index] = actionNode;
        }
      }
    });
  };
}
