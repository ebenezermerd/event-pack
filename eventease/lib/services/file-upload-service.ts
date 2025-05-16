import { MAX_FILE_SIZE } from "@/lib/env"
import { apiClient } from "@/lib/api-client"

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
  const { maxSizeMB = MAX_FILE_SIZE, allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"] } =
    options

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
 * Gets a signed URL for direct upload to S3
 * This would be implemented on the backend
 */
export async function getSignedUploadUrl(
  filename: string,
  filetype: string,
  type: FileUploadType,
): Promise<{ uploadUrl: string; fileUrl: string }> {
  try {
    const response = await apiClient.post<{ uploadUrl: string; fileUrl: string }>("/api/upload/signed-url", {
      filename,
      filetype,
      type,
    })

    return response
  } catch (error) {
    console.error("Failed to get signed URL:", error)
    throw error
  }
}
