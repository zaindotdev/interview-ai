"use client";

import type React from "react";

import { useState } from "react";
import { CloudUpload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DragAndDropInputProps {
  handleFileSelect: (file: File) => void;
}
export default function DragAndDropInput({ handleFileSelect }: DragAndDropInputProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

 

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="relative h-[200px]">
        <div
          className={`flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition-all duration-200 ${
            isDragOver
              ? "border-primary bg-primary/10 scale-[1.02]"
              : "border-primary hover:border-primary/80 hover:bg-primary/5"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CloudUpload
            className={`mx-auto h-8 w-8 transition-colors ${
              isDragOver ? "text-primary animate-bounce" : "text-primary"
            }`}
          />
          <p className="text-muted-foreground mx-auto mt-2 mb-2 max-w-sm text-center text-sm font-medium md:text-base">
            {isDragOver
              ? "Drop your PDF file here"
              : "Upload your resume to get started"}
          </p>
          <p className="text-muted-foreground mx-auto mb-2 max-w-sm text-center text-sm font-medium md:text-base">
            {isDragOver ? "" : "File size should not exceed 5MB"}
          </p>
          <p className="text-muted-foreground mx-auto max-w-sm text-center text-sm font-medium md:text-base">
            {isDragOver ? "" : "Acceptable file types: PDF"}
          </p>
          {!isDragOver && (
            <p className="text-primary mx-auto mt-2 text-xs font-medium">
              Click to browse or drag & drop
            </p>
          )}
        </div>
        <input
          type="file"
          className="absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 transform cursor-pointer opacity-0"
          accept=".pdf"
          onChange={handleFileChange}
        />
      </div>

      {selectedFile && (
        <div className="bg-muted/50 mt-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="text-primary h-5 w-5" />
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-muted-foreground text-xs">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
