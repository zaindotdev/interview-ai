"use client";

import type React from "react";
import { useState, useRef } from "react";
import { CloudUpload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DragAndDropInputProps {
  // null signals the parent that the file was removed
  handleFileSelect: (file: File | null) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function DragAndDropInput({ handleFileSelect }: DragAndDropInputProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptFile = (file: File) => {
    setSelectedFile(file);
    handleFileSelect(file); // ✅ notify parent
  };

  const removeFile = () => {
    setSelectedFile(null);
    handleFileSelect(null); // ✅ notify parent of removal
    // reset native input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) acceptFile(file); // ✅ was missing setSelectedFile
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) acceptFile(file); // ✅ was missing setSelectedFile
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className="w-full space-y-3"> {/* ✅ removed max-w-md so it fills the form */}

      {/* Drop zone */}
      <div className="relative">
        <div
          className={cn(
            "flex h-44 flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all duration-200 cursor-pointer select-none",
            isDragOver
              ? "border-primary bg-primary/10 scale-[1.01]"
              : selectedFile
              ? "border-primary/40 bg-primary/5"
              : "border-border hover:border-primary/60 hover:bg-primary/5"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
        >
          <CloudUpload
            className={cn(
              "h-8 w-8 mb-2 transition-all",
              isDragOver ? "text-primary scale-110 animate-bounce" : "text-muted-foreground"
            )}
          />

          {isDragOver ? (
            <p className="text-sm font-medium text-primary">Drop your PDF file here</p>
          ) : (
            <>
              <p className="text-sm font-medium text-foreground text-center">
                <span className="text-primary">Click to browse</span> or drag & drop
              </p>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                PDF only · Max 10MB
              </p>
            </>
          )}
        </div>

        {/* ✅ Scoped to the drop zone div, not absolutely centered across the page */}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeFile}
            className="shrink-0 h-8 w-8 p-0 ml-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}