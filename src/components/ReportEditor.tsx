import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered,
  ImageIcon, TableIcon, Undo, Redo, Download,
} from "lucide-react";
import { useRef } from "react";

interface ReportEditorProps {
  content: string;
  onUpdate?: (html: string) => void;
  onExportPdf?: () => void;
}

export function ReportEditor({ content, onUpdate, onExportPdf }: ReportEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[300px] sm:min-h-[400px] p-3 sm:p-4",
      },
    },
  });

  if (!editor) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card max-w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 border-b border-border bg-muted/30">
        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => editor.chain().focus().toggleBold().run()} data-active={editor.isActive("bold")}>
          <Bold className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <Separator orientation="vertical" className="h-5 mx-0.5" />
        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 hidden sm:flex" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <Separator orientation="vertical" className="h-5 mx-0.5" />
        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <Separator orientation="vertical" className="h-5 mx-0.5" />
        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => fileRef.current?.click()}>
          <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={insertTable}>
          <TableIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <Separator orientation="vertical" className="h-5 mx-0.5" />
        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <div className="ml-auto">
          <Button size="sm" className="h-7 text-xs sm:h-8 sm:text-sm" onClick={onExportPdf}>
            <Download className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Exportar PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      <div className="overflow-x-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
