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
  RocketIcon,
  SaveIcon,
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
      isCode: editor.isActive("code") ?? false,
      canCode: editor.can().chain().toggleCode().run() ?? false,
      canClearMarks: editor.can().chain().unsetAllMarks().run() ?? false,
      isParagraph: editor.isActive("paragraph") ?? false,
      isHeading: editor.isActive("heading") ?? false,
      isHeading1: editor.isActive("heading", { level: 1 }) ?? false,
      isHeading2: editor.isActive("heading", { level: 2 }) ?? false,
      isHeading3: editor.isActive("heading", { level: 3 }) ?? false,
      isHeading4: editor.isActive("heading", { level: 4 }) ?? false,
      isHeading5: editor.isActive("heading", { level: 5 }) ?? false,
      isHeading6: editor.isActive("heading", { level: 6 }) ?? false,
      isBulletList: editor.isActive("bulletList") ?? false,
      isOrderedList: editor.isActive("orderedList") ?? false,
      isCodeBlock: editor.isActive("codeBlock") ?? false,
      isBlockquote: editor.isActive("blockquote") ?? false,
      canUndo: editor.can().chain().undo().run() ?? false,
      canRedo: editor.can().chain().redo().run() ?? false,
    }),
  });

  function onSave() {
    console.log(JSON.stringify(editor.getJSON(), undefined, 2));
  }

  return (
    <div className="flex flex-row flex-wrap items-center gap-3 mb-4">
      <ToggleGroup variant="outline" type="multiple">
        <ToggleGroupItem
          value="bold"
          title="Toggle bold"
          aria-label="Toggle bold"
          data-state={editorState.isBold ? "on" : "off"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editorState.canBold}
        >
          <BoldIcon className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="italic"
          title="Toggle italic"
          aria-label="Toggle italic"
          data-state={editorState.isItalic ? "on" : "off"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editorState.canItalic}
        >
          <ItalicIcon className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="underline"
          title="Toggle underline"
          aria-label="Toggle underline"
          data-state={editorState.isUnderline ? "on" : "off"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editorState.canUnderline}
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="strikethrough"
          title="Toggle strikethrough"
          aria-label="Toggle strikethrough"
          data-state={editorState.isStrikethrough ? "on" : "off"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editorState.canStrikethrough}
        >
          <StrikethroughIcon className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <Button
        variant="ghost"
        size="icon"
        title="Add action"
        className="border border-border"
        onClick={() =>
          editor
            .chain()
            .insertContent({
              type: "reactComponent",
              attrs: { count: 42 },
            })
            .run()
        }
      >
        <RocketIcon className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            title="Set heading"
            className="border border-border"
          >
            {!editorState.isHeading && <HeadingIcon className="h-4 w-4" />}
            {editorState.isHeading1 && <Heading1Icon className="h-4 w-4" />}
            {editorState.isHeading2 && <Heading2Icon className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className={cn("flex flex-row items-center justify-between")}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1Icon className="h-4 w-4" />
            {editorState.isHeading1 && <DotIcon className="h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn("flex flex-row items-center justify-between")}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2Icon className="h-4 w-4" />
            {editorState.isHeading2 && <DotIcon className="h-4 w-4" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex flex-row items-center gap-x-1">
        <Button
          variant="ghost"
          size="icon"
          title="Undo"
          className="border border-border"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editorState.canUndo}
        >
          <UndoIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Redo"
          className="border border-border"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editorState.canRedo}
        >
          <RedoIcon className="h-4 w-4" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        title="Save"
        className="border border-border"
        onClick={onSave}
      >
        <SaveIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
