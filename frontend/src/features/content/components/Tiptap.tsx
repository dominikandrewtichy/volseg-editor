import { TextStyleKit } from "@tiptap/extension-text-style";
import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

function MenuBar({ editor }: { editor: Editor }) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isHeading1: ctx.editor.isActive("heading", { level: 1 }),
      canUndo: ctx.editor.can().chain().undo().run(),
      canRedo: ctx.editor.can().chain().redo().run(),
    }),
  });

  const buttonBase =
    "px-2 py-1 rounded-md border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed";
  const activeButton = "font-bold";

  return (
    <div className="flex flex-wrap gap-2 mb-4 p-2 bg-secondary border border-primary rounded-lg">
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`${buttonBase} ${editorState.isHeading1 ? activeButton : ""}`}
      >
        H1
      </button>

      {/* Undo/Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editorState.canUndo}
        className={buttonBase}
      >
        Undo
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editorState.canRedo}
        className={buttonBase}
      >
        Redo
      </button>
    </div>
  );
}

export function Tiptap() {
  const editor = useEditor({
    extensions: [TextStyleKit, StarterKit],
    content: `
      <h1>Hi there,</h1>
      <p>
        this is a basic example of Tiptap
      </p>
    `,
  });

  return (
    <div className="max-h-2/3">
      {editor && <MenuBar editor={editor} />}
      <EditorContent
        editor={editor}
        className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto"
      />
    </div>
  );
}
