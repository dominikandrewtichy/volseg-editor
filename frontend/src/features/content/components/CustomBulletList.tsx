import { BulletList } from "@tiptap/extension-bullet-list";

export const CustomBulletList = BulletList.extend({
  addKeyboardShortcuts() {
    return {
      "Mod-l": () => this.editor.commands.toggleBulletList(),
      "Ctrl-1": () => this.editor.commands.clearContent(),
    };
  },
});
