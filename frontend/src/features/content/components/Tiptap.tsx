import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ReactComponent } from "./extension";
import { InlineButton } from "./InlineButton";
import { CustomBulletList } from "./CustomBulletList";
import { EditorMenuBar } from "./EditorMenuBar";
import { useMemo } from "react";

interface EditorProps {
  isEditing: boolean;
}

export function Editor({ isEditing }: EditorProps) {
  const content = useMemo(() => {
    const savedContent = localStorage.getItem("editorContent");
    return savedContent ? JSON.parse(savedContent) : "";
  }, [isEditing]);

  const editor = useEditor(
    {
      extensions: [StarterKit, ReactComponent, CustomBulletList, InlineButton],
      content,
      editable: isEditing,
      // onUpdate: ({ editor }) => {
      //   console.log(JSON.stringify(editor.getJSON(), undefined, 2));
      // },
    },
    [content, isEditing],
  );

  return (
    <div className="flex flex-col">
      {editor && isEditing && <EditorMenuBar editor={editor} />}
      <EditorContent
        editor={editor}
        className="rounded-lg max-h-96 overflow-y-none"
      />
    </div>
  );
}
