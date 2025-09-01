import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ReactComponent } from "./extension";
import { InlineButton } from "./InlineButton";
import { CustomBulletList } from "./CustomBulletList";
import { EditorMenuBar } from "./EditorMenuBar";
import { useMemo } from "react";

export function Tiptap() {
  const content = useMemo(() => {
    const savedContent = localStorage.getItem("editorContent");
    return savedContent ? JSON.parse(savedContent) : "";
  }, []);

  const editor = useEditor({
    extensions: [StarterKit, ReactComponent, CustomBulletList, InlineButton],
    content,
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
