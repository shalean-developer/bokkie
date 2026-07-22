"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import {
  prepareBlogImageForUpload,
  BlogImageValidationError,
} from "@/lib/utils/prepare-blog-image";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
  uploadUrl?: string;
  minHeight?: number;
}

type ToolbarButton = {
  icon: React.ReactNode;
  label: string;
  action: () => void;
  active?: boolean;
};

export default function RichTextEditor({
  value,
  onChange,
  disabled = false,
  placeholder = "Write your content…",
  uploadUrl = "/api/admin/cms/upload",
  minHeight = 320,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  // Tracks HTML we last pushed to the parent so external value sync
  // does not fight live typing (and SEO can update on every keystroke).
  const lastEmittedHtml = useRef<string | null>(null);
  const [showSource, setShowSource] = useState(false);
  const [sourceValue, setSourceValue] = useState(value);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<{
    url: string;
    alt: string;
  } | null>(null);

  useEffect(() => {
    if (showSource) {
      setSourceValue(value);
      return;
    }

    if (!editorRef.current) return;

    // Skip overwriting the editable surface when the incoming value is
    // the same HTML we just emitted from typing/toolbar actions.
    if (lastEmittedHtml.current === value) {
      return;
    }

    if (editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value, showSource]);

  const emitChange = useCallback(
    (html: string) => {
      // Emit live editor HTML immediately so SEO score / word counts update
      // while typing. Sanitization still happens on save in server actions.
      const next = html ?? "";
      lastEmittedHtml.current = next;
      onChange(next);
    },
    [onChange]
  );

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const exec = (command: string, commandValue?: string) => {
    if (disabled || showSource) return;
    focusEditor();
    document.execCommand(command, false, commandValue);
    if (editorRef.current) {
      emitChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      emitChange(editorRef.current.innerHTML);
    }
  };

  const handleSourceBlur = () => {
    emitChange(sourceValue);
  };

  const toggleSource = () => {
    if (showSource) {
      emitChange(sourceValue);
      setShowSource(false);
    } else {
      setSourceValue(value);
      setShowSource(true);
    }
  };

  const insertLink = () => {
    if (disabled || showSource) return;
    const url = window.prompt("Enter link URL:");
    if (!url?.trim()) return;
    exec("createLink", url.trim());
  };

  const uploadImage = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);

    try {
      const prepared = await prepareBlogImageForUpload(file);
      const body = new FormData();
      body.append("file", prepared.file);
      body.append("filename", prepared.file.name);

      const response = await fetch(uploadUrl, {
        method: "POST",
        body,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      setPendingImage({ url: data.url, alt: "" });
    } catch (err) {
      if (err instanceof BlogImageValidationError) {
        setUploadError(err.message);
      } else if (err instanceof Error) {
        setUploadError(err.message);
      } else {
        setUploadError("Failed to upload image");
      }
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  const insertPendingImage = () => {
    if (!pendingImage || disabled || showSource) return;

    const alt = pendingImage.alt.replace(/"/g, "&quot;");
    focusEditor();
    const imgHtml = `<img src="${pendingImage.url}" alt="${alt}" />`;
    document.execCommand("insertHTML", false, imgHtml);

    if (editorRef.current) {
      emitChange(editorRef.current.innerHTML);
    }
    setPendingImage(null);
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files?.length || disabled || isUploading) return;
    void uploadImage(files[0]);
  };

  const toolbarGroups: ToolbarButton[][] = [
    [
      { icon: <Bold className="w-4 h-4" />, label: "Bold", action: () => exec("bold") },
      { icon: <Italic className="w-4 h-4" />, label: "Italic", action: () => exec("italic") },
      { icon: <Underline className="w-4 h-4" />, label: "Underline", action: () => exec("underline") },
      { icon: <Strikethrough className="w-4 h-4" />, label: "Strikethrough", action: () => exec("strikeThrough") },
    ],
    [
      { icon: <Heading2 className="w-4 h-4" />, label: "Heading 2", action: () => exec("formatBlock", "h2") },
      { icon: <Heading3 className="w-4 h-4" />, label: "Heading 3", action: () => exec("formatBlock", "h3") },
      { icon: <Quote className="w-4 h-4" />, label: "Quote", action: () => exec("formatBlock", "blockquote") },
    ],
    [
      { icon: <List className="w-4 h-4" />, label: "Bullet list", action: () => exec("insertUnorderedList") },
      { icon: <ListOrdered className="w-4 h-4" />, label: "Numbered list", action: () => exec("insertOrderedList") },
      { icon: <Link2 className="w-4 h-4" />, label: "Insert link", action: insertLink },
      {
        icon: isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ImagePlus className="w-4 h-4" />
        ),
        label: "Insert image",
        action: () => imageInputRef.current?.click(),
      },
    ],
    [
      { icon: <Undo2 className="w-4 h-4" />, label: "Undo", action: () => exec("undo") },
      { icon: <Redo2 className="w-4 h-4" />, label: "Redo", action: () => exec("redo") },
      {
        icon: <Code className="w-4 h-4" />,
        label: showSource ? "Visual editor" : "HTML source",
        action: toggleSource,
        active: showSource,
      },
    ],
  ];

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        {toolbarGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="flex items-center gap-0.5">
            {groupIndex > 0 && (
              <div className="w-px h-6 bg-gray-300 mx-1" aria-hidden />
            )}
            {group.map((button) => (
              <button
                key={button.label}
                type="button"
                title={button.label}
                onClick={button.action}
                disabled={disabled || (button.label === "Insert image" && isUploading)}
                className={`p-2 rounded-md transition-colors ${
                  button.active
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-200"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {button.icon}
              </button>
            ))}
          </div>
        ))}
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="sr-only"
        disabled={disabled || isUploading}
        onChange={(e) => handleImageFiles(e.target.files)}
      />

      {pendingImage && (
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 p-3 border-b border-gray-200 bg-blue-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pendingImage.url}
            alt=""
            className="w-16 h-16 rounded object-cover border border-gray-200 bg-white flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Image alt attributes
            </label>
            <input
              type="text"
              value={pendingImage.alt}
              onChange={(e) =>
                setPendingImage((prev) =>
                  prev ? { ...prev, alt: e.target.value } : prev
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  insertPendingImage();
                }
              }}
              disabled={disabled}
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              placeholder="Describe this image for SEO & accessibility…"
            />
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setPendingImage(null)}
              disabled={disabled}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={insertPendingImage}
              disabled={disabled}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Insert image
            </button>
          </div>
        </div>
      )}

      {showSource ? (
        <textarea
          value={sourceValue}
          onChange={(e) => {
            const next = e.target.value;
            setSourceValue(next);
            emitChange(next);
          }}
          onBlur={handleSourceBlur}
          disabled={disabled}
          rows={16}
          className="w-full px-4 py-3 font-mono text-sm border-0 focus:ring-0 focus:outline-none resize-y"
          style={{ minHeight }}
          placeholder="Edit HTML source…"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={handleInput}
          data-placeholder={placeholder}
          className="px-4 py-3 text-sm text-gray-900 focus:outline-none prose prose-sm max-w-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_img]:max-w-full [&_img]:rounded-lg [&_a]:text-blue-600 [&_a]:underline"
          style={{ minHeight }}
        />
      )}

      {uploadError && (
        <p className="px-4 py-2 text-sm text-red-600 border-t border-gray-200" role="alert">
          {uploadError}
        </p>
      )}
    </div>
  );
}
