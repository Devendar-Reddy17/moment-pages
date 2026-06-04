'use client';

import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/stores/editorStore';
import { Plus, X } from 'lucide-react';

export function PageTabs() {
  const {
    pages,
    currentPageIndex,
    goToPage,
    addPage,
    removePage,
    renamePage,
  } = useEditorStore();

  return (
    <div className="h-10 bg-white border-t border-gray-200 flex items-center px-2 gap-1 shrink-0">
      {pages.map((page, index) => (
        <div
          key={page.id}
          className={`group flex items-center gap-1 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
            index === currentPageIndex
              ? 'bg-rose-50 text-rose-700 font-medium'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => goToPage(index)}
        >
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const newName = e.currentTarget.textContent?.trim();
              if (newName && newName !== page.name) {
                renamePage(index, newName);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            className="outline-none min-w-[40px]"
          >
            {page.name}
          </span>
          {pages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                removePage(index);
              }}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
              title="Remove page"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}

      {pages.length < 3 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-gray-500 hover:text-rose-600"
          onClick={addPage}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Page
        </Button>
      )}
    </div>
  );
}
