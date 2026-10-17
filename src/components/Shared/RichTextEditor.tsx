import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Indent, Italic, Link2, List, ListOrdered, Outdent, Redo2, RemoveFormatting, Strikethrough, Underline, Undo2 } from 'lucide-react';
import { sanitizeHtml } from '../../utils/richText';

type RichTextEditorProps = {
  label: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

type ToolbarButton = { title: string; icon: ReactNode; command: string };

// Pure data: handlers run only from events, so nothing here reads the editor ref while rendering.
const toolbarGroups: ToolbarButton[][] = [
  [
    { title: 'Undo', icon: <Undo2 size={15} />, command: 'undo' },
    { title: 'Redo', icon: <Redo2 size={15} />, command: 'redo' },
  ],
  [
    { title: 'Bold', icon: <Bold size={15} />, command: 'bold' },
    { title: 'Italic', icon: <Italic size={15} />, command: 'italic' },
    { title: 'Underline', icon: <Underline size={15} />, command: 'underline' },
    { title: 'Strikethrough', icon: <Strikethrough size={15} />, command: 'strikeThrough' },
    { title: 'Insert link', icon: <Link2 size={15} />, command: 'link' },
  ],
  [
    { title: 'Align left', icon: <AlignLeft size={15} />, command: 'justifyLeft' },
    { title: 'Align centre', icon: <AlignCenter size={15} />, command: 'justifyCenter' },
    { title: 'Align right', icon: <AlignRight size={15} />, command: 'justifyRight' },
    { title: 'Justify', icon: <AlignJustify size={15} />, command: 'justifyFull' },
  ],
  [
    { title: 'Bulleted list', icon: <List size={15} />, command: 'insertUnorderedList' },
    { title: 'Numbered list', icon: <ListOrdered size={15} />, command: 'insertOrderedList' },
    { title: 'Decrease indent', icon: <Outdent size={15} />, command: 'outdent' },
    { title: 'Increase indent', icon: <Indent size={15} />, command: 'indent' },
    { title: 'Clear formatting', icon: <RemoveFormatting size={15} />, command: 'removeFormat' },
  ],
];

// Remount with a new `key` to load different content; the editable area is uncontrolled so the caret never jumps.
export default function RichTextEditor({ label, value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = sanitizeHtml(value);
    // Initial content only; later edits come from the user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = () => { if (editorRef.current) onChange(sanitizeHtml(editorRef.current.innerHTML)); };
  const command = (name: string, argument?: string) => { editorRef.current?.focus(); document.execCommand(name, false, argument); emit(); };

  const addLink = () => {
    const url = window.prompt('Link address (https://…)');
    if (!url) return;
    if (!/^(https?:\/\/|mailto:)/i.test(url.trim())) { window.alert('Links must start with http://, https:// or mailto:'); return; }
    command('createLink', url.trim());
  };

  const groups = toolbarGroups;

  return (
    <div>
      <div role="toolbar" aria-label={`${label} formatting`} className="flex flex-wrap items-center gap-1 rounded-t-lg border border-gray-200 bg-white px-2 py-1.5">
        <select
          aria-label="Text style"
          defaultValue="p"
          onChange={event => { command('formatBlock', event.target.value); event.target.value = 'p'; }}
          className="rounded border border-transparent bg-white px-2 py-1 text-sm text-gray-700 hover:border-gray-200"
        >
          <option value="p">Paragraph</option>
          <option value="h3">Heading</option>
          <option value="blockquote">Quote</option>
        </select>
        {groups.map((group, index) => (
          <div key={index} className="flex items-center gap-0.5 border-l border-gray-200 pl-1">
            {group.map(button => (
              <button key={button.title} type="button" title={button.title} aria-label={button.title} onMouseDown={event => event.preventDefault()} onClick={() => button.command === 'link' ? addLink() : command(button.command)} className="rounded p-1.5 text-gray-600 hover:bg-gray-100">{button.icon}</button>
            ))}
          </div>
        ))}
      </div>
      <div
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={emit}
        className="min-h-48 rounded-b-lg border border-t-0 border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-primary-500 empty:before:text-gray-400 empty:before:content-[attr(data-placeholder)] [&_a]:text-primary-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_h3]:text-base [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-6"
      />
    </div>
  );
}
