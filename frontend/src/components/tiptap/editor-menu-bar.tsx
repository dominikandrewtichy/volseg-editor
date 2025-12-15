import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import {
  BoldIcon,
  DotIcon,
  Heading1Icon,
  Heading2Icon,
  HeadingIcon,
  ItalicIcon,
  RedoIcon,
  StrikethroughIcon,
  UnderlineIcon,
  UndoIcon,
} from "lucide-react";

interface EditorMenuBarProps {
  editor: Editor;
}

export function EditorMenuBar({ editor }: EditorMenuBarProps) {
  const editorState = useEditorState({
    editor,
    selector: ({ editor }: { editor: Editor }) => ({
      isBold: editor.isActive("bold") ?? false,
      canBold: editor.can().chain().toggleBold().run() ?? false,
      isItalic: editor.isActive("italic") ?? false,
      canItalic: editor.can().chain().toggleItalic().run() ?? false,
      isUnderline: editor.isActive("underline") ?? false,
      canUnderline: editor.can().chain().toggleUnderline().run() ?? false,
      isStrikethrough: editor.isActive("strike") ?? false,
      canStrikethrough: editor.can().chain().toggleStrike().run() ?? false,
      isHeading: editor.isActive("heading") ?? false,
      isHeading1: editor.isActive("heading", { level: 1 }) ?? false,
      isHeading2: editor.isActive("heading", { level: 2 }) ?? false,
      canUndo: editor.can().chain().undo().run() ?? false,
      canRedo: editor.can().chain().redo().run() ?? false,
    }),
  });

  return (
    <div className="flex flex-row flex-wrap items-center gap-1 p-1 border rounded-md bg-muted/20">
      <ToggleGroup type="multiple" size="sm">
        <ToggleGroupItem
          value="bold"
          aria-label="Toggle bold"
          data-state={editorState.isBold ? "on" : "off"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editorState.canBold}
        >
          <BoldIcon className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="italic"
          aria-label="Toggle italic"
          data-state={editorState.isItalic ? "on" : "off"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editorState.canItalic}
        >
          <ItalicIcon className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="underline"
          aria-label="Toggle underline"
          data-state={editorState.isUnderline ? "on" : "off"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editorState.canUnderline}
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="strikethrough"
          aria-label="Toggle strikethrough"
          data-state={editorState.isStrikethrough ? "on" : "off"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editorState.canStrikethrough}
        >
          <StrikethroughIcon className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="w-px h-6 bg-border mx-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            title="Headings"
            className={cn("h-9 w-9 p-0", editorState.isHeading && "bg-accent")}
          >
            {editorState.isHeading1 ? (
              <Heading1Icon className="h-4 w-4" />
            ) : editorState.isHeading2 ? (
              <Heading2Icon className="h-4 w-4" />
            ) : (
              <HeadingIcon className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1Icon className="h-4 w-4 mr-2" />
            Heading 1
            {editorState.isHeading1 && <DotIcon className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2Icon className="h-4 w-4 mr-2" />
            Heading 2
            {editorState.isHeading2 && <DotIcon className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-6 bg-border mx-1" />

      <div className="flex flex-row items-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editorState.canUndo}
        >
          <UndoIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editorState.canRedo}
        >
          <RedoIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
