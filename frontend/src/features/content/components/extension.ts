import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { Component } from "./Component";

export const ReactComponent = Node.create({
  name: "reactComponent",

  group: "inline",
  inline: true,

  atom: true,

  addAttributes() {
    return {
      actionId: { default: null },
      params: { default: {} },
      label: { default: "" }, // <-- add label
    };
  },

  parseHTML() {
    return [
      {
        tag: "react-component",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["react-component", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(Component);
  },
});
