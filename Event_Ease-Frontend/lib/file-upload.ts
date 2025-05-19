import { apiClient } from "./api-client"

// File upload types
export type FileUploadType = "event-image" | "event-gallery" | "organizer-logo" | "organizer-document" | "profile"

/**
 * Interface for file upload response
 */
export interface FileUploadResponse {
  url: string
  filename: string
  mimetype: string
  size: number
}

/**
 * Interface for file upload progress
 */
export interface FileUploadProgress {
  progress: number
  uploaded: boolean
  error: string | null
  url: string | null
}

/**
 * Validates a file before upload
 */
export function validateFile(
  file: File,
  options: {
    maxSizeMB?: number
    allowedTypes?: string[]
  } = {},
): { valid: boolean; error?: string } {
  // Default options
  const { maxSizeMB = 5, allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"] } = options

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
    }
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    }
  }

  return { valid: true }
}

/**
 * Uploads a file to the server
 */
export async function uploadFile(
  file: File,
  type: FileUploadType,
  onProgress?: (progress: number) => void,
): Promise<FileUploadResponse> {
  // Create form data
  const formData = new FormData()
  formData.append("file", file)
  formData.append("type", type)

  try {
    // Upload file
    const response = await apiClient.post<FileUploadResponse>("/api/upload", formData, {
      // Don't set Content-Type header, browser will set it with boundary
      headers: {},
    })

    return response
  } catch (error) {
    console.error("File upload failed:", error)
    throw error
  }
}

/**
 * Uploads multiple files to the server
 */
export async function uploadMultipleFiles(
  files: File[],
  type: FileUploadType,
  onProgress?: (progress: number) => void,
): Promise<FileUploadResponse[]> {
  // Upload files in parallel
  const uploadPromises = files.map((file) => uploadFile(file, type, onProgress))
  return Promise.all(uploadPromises)
}

/**
 * Creates an object URL from a file
 */
export function createFilePreview(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * Revokes an object URL
 */
export function revokeFilePreview(url: string): void {
  URL.revokeObjectURL(url)
}

/**
 * Gets file extension from a filename
 */
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || ""
}

/**
 * Checks if a file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/")
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + " B"
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + " KB"
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB"
  }
}
