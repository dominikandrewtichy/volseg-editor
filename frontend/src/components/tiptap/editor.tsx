import { cn } from "@/lib/utils";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { EditorMenuBar } from "./editor-menu-bar";

interface EditorProps {
  value?: string | null;
  onChange?: (value: string) => void;
  isEditing: boolean;
}

export function Editor({ value, onChange, isEditing }: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    editable: isEditing,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] py-2",
          isEditing ? "px-3" : "px-0",
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && editor.isEditable !== isEditing) {
      editor.setEditable(isEditing);
    }
  }, [isEditing, editor]);

  return (
    <div
      className={cn(
        "flex flex-col w-full gap-2",
        isEditing && "border rounded-md ",
      )}
    >
      {editor && isEditing && (
        <div className="p-2 bg-muted/10">
          <EditorMenuBar editor={editor} />
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
