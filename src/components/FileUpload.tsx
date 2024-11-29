import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  maxFiles?: number;
  maxSize?: number; // in bytes
  onFilesSelect?: (files: File[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  maxFiles = 1,
  maxSize = Infinity,
  onFilesSelect,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(droppedFiles);

    updateFiles(validFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    const validFiles = validateFiles(selectedFiles);

    updateFiles(validFiles);
  };

  const validateFiles = (newFiles: File[]): File[] => {
    return newFiles.filter((file) => {
      const isValidSize = file.size <= maxSize;
      const wouldExceedLimit = files.length + newFiles.length <= maxFiles;

      return isValidSize && wouldExceedLimit;
    });
  };

  const updateFiles = (newFiles: File[]): void => {
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesSelect?.(updatedFiles);
  };

  const clearFiles = (): void => {
    setFiles([]);
    onFilesSelect?.([]);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="w-full space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
              h-48 
              rounded-lg 
              border-2 
              border-dashed 
              flex 
              flex-col 
              items-center 
              justify-center 
              gap-4
              cursor-pointer
              transition-colors
              ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}
            `}
      >
        <Upload className="w-8 h-8 text-gray-500" />
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Drag and drop files here, or click to select files
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {maxFiles < Infinity && `Up to ${maxFiles} files`}
            {maxSize < Infinity && ` (Max ${formatFileSize(maxSize)} each)`}
          </p>
        </div>
      </div>
      <input
        type="file"
        className="hidden"
        ref={inputRef}
        onChange={handleFileSelect}
        multiple={maxFiles !== 1}
      />

      {files.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Selected Files:</h3>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {file.name} ({formatFileSize(file.size)})
                </li>
              ))}
            </ul>
            <Button variant="secondary" className="mt-4" onClick={clearFiles}>
              Clear Files
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
