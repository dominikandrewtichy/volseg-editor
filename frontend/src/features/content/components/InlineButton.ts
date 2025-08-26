// InlineButton.js
import { Node, mergeAttributes } from "@tiptap/core";

export const InlineButton = Node.create({
  name: "inlineButton",
  group: "inline",
  inline: true,
  selectable: true,
  atom: true, // treat as single unit

  addAttributes() {
    return {
      label: {
        default: "Click Me",
      },
      href: {
        default: "#",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "button[data-inline-button]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "button",
      mergeAttributes(HTMLAttributes, {
        "data-inline-button": "true",
        type: "button",
      }),
      HTMLAttributes.label,
    ];
  },

  addCommands() {
    return {
      insertInlineButton:
        (options) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: options,
            })
            .run();
        },
    };
  },
});
