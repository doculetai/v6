'use client';

import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";

import { primitivesCopy } from "@/config/copy/primitives";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  accept?: string;
  maxSize?: number;
  onUpload: (file: File) => void | Promise<void>;
  multiple?: boolean;
  dropzoneText?: string;
  constraintsText?: string;
  disabled?: boolean;
  className?: string;
}

type DropzoneState = "idle" | "drag-hover" | "error";

const DEFAULT_ACCEPT = ".pdf,.jpg,.jpeg,.png";
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_DROPZONE_TEXT = "Drop file here or click to browse";
const DEFAULT_CONSTRAINTS_TEXT = "PDF, JPG, PNG · Max 10MB";
const ERROR_INVALID_FILE_TYPE = "This file type is not supported";
const ERROR_FILE_TOO_LARGE = "File must be under 10MB";

function getAcceptedExtensions(accept: string): string[] {
  return accept
    .split(",")
    .map((ext) => ext.trim().toLowerCase())
    .filter(Boolean);
}

function validateFileType(file: File, accept: string): boolean {
  const extensions = getAcceptedExtensions(accept);
  const fileName = file.name.toLowerCase();
  return extensions.some((ext) => fileName.endsWith(ext));
}

function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

export function FileUploader({
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  onUpload,
  multiple = false,
  dropzoneText = primitivesCopy.fileUploader.dropzone,
  constraintsText = primitivesCopy.fileUploader.constraintsDefault,
  disabled = false,
  className,
}: FileUploaderProps) {
  const [state, setState] = useState<DropzoneState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetError = useCallback(() => {
    setState("idle");
    setErrorMessage(null);
  }, []);

  const processFile = useCallback(
    (file: File) => {
      if (!validateFileType(file, accept)) {
        setState("error");
        setErrorMessage(primitivesCopy.fileUploader.errorInvalidType);
        return;
      }

      if (!validateFileSize(file, maxSize)) {
        setState("error");
        setErrorMessage(primitivesCopy.fileUploader.errorFileTooLarge);
        return;
      }

      resetError();
      onUpload(file);
    },
    [accept, maxSize, onUpload, resetError],
  );

  const handleClick = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      if (multiple) {
        for (let i = 0; i < files.length; i++) {
          processFile(files[i]);
        }
      } else {
        processFile(files[0]);
      }

      // Reset input so the same file can be selected again
      event.target.value = "";
    },
    [multiple, processFile],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (disabled) return;

      setState("idle");

      const files = event.dataTransfer.files;
      if (!files || files.length === 0) return;

      if (multiple) {
        for (let i = 0; i < files.length; i++) {
          processFile(files[i]);
        }
      } else {
        processFile(files[0]);
      }
    },
    [disabled, multiple, processFile],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
    },
    [],
  );

  const handleDragEnter = useCallback(
    (event: React.DragEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!disabled) {
        setState("drag-hover");
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!disabled) {
        setState((prev) => (prev === "drag-hover" ? "idle" : prev));
      }
    },
    [disabled],
  );

  const isDragHover = state === "drag-hover";
  const isError = state === "error";

  return (
    <div className={cn("w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        data-state={state}
        aria-label={dropzoneText}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isDragHover && "border-primary bg-primary/5",
          isError && "border-destructive",
          !isDragHover && !isError && "border-border",
          disabled && "cursor-not-allowed opacity-50",
          !disabled && "cursor-pointer hover:border-muted-foreground/50",
        )}
      >
        <Upload
          className={cn(
            "h-8 w-8",
            isDragHover ? "text-primary" : "text-muted-foreground",
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            "text-sm font-medium",
            isDragHover ? "text-primary" : "text-foreground",
          )}
        >
          {isDragHover ? primitivesCopy.fileUploader.releaseToUpload : dropzoneText}
        </span>
        <span className="text-xs text-muted-foreground">
          {constraintsText}
        </span>
      </button>

      {isError && errorMessage && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
