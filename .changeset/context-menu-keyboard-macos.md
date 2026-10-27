---
"@amezquita/design-system": patch
---

ContextMenu opens from the keyboard on macOS. Shift+F10 and the Menu key relied on the browser turning them into a `contextmenu` event, which Windows and Linux do and macOS doesn't, so a Mac keyboard user had no way to open the menu. The trigger now handles both keys itself on every platform, opening the menu at the area's bottom-left corner with focus on the first item.
