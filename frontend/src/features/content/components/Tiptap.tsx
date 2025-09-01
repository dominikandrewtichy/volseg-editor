import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ReactComponent } from "./extension";
import { InlineButton } from "./InlineButton";
import { CustomBulletList } from "./CustomBulletList";
import { EditorMenuBar } from "./EditorMenuBar";

export function Tiptap() {
  const editor = useEditor({
    extensions: [StarterKit, ReactComponent, CustomBulletList, InlineButton],
    content: `
      <h1>Hi there,</h1>
      <p>
        this is a basic example of Tiptap
      </p>
      <strong>something</strong>
      <react-component count="0"></react-component>
    `,
    // onUpdate: ({ editor }) => {
    //   console.log(JSON.stringify(editor.getJSON(), undefined, 2));
    // },
  });

  return (
    <div className="max-h-2/3">
      {editor && <EditorMenuBar editor={editor} />}
      <EditorContent
        editor={editor}
        className="border border-border rounded-lg p-4 max-h-96 overflow-y-auto"
      />
    </div>
  );
}
