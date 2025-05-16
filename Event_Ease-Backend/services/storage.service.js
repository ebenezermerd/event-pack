// services/storage.service.js
const { v4: uuidv4 } = require("uuid")
const fs = require("fs")
const path = require("path")
const { promisify } = require("util")
const crypto = require("crypto")
const sharp = require("sharp")
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
const { Storage } = require("@google-cloud/storage")
const { BlobServiceClient } = require("@azure/storage-blob")
const storageConfig = require("../config/storage.config")
const FileUpload = require("../models/fileUpload")

class StorageService {
  constructor() {
    this.initializeProviders()
  }

  /**
   * Initialize storage providers
   */
  initializeProviders() {
    // Initialize local storage
    if (storageConfig.providers.local.enabled) {
      const basePath = storageConfig.providers.local.basePath

      if (storageConfig.providers.local.createPath && !fs.existsSync(basePath)) {
        fs.mkdirSync(basePath, { recursive: true })
      }

      // Create subdirectories for each file type
      Object.values(storageConfig.fileTypes).forEach((fileType) => {
        const typePath = path.join(basePath, fileType.path)

        if (!fs.existsSync(typePath)) {
          fs.mkdirSync(typePath, { recursive: true })
        }
      })
    }

    // Initialize S3
    if (storageConfig.providers.s3.enabled) {
      this.s3Client = new S3Client({
        region: storageConfig.providers.s3.region,
        credentials: {
          accessKeyId: storageConfig.providers.s3.accessKeyId,
          secretAccessKey: storageConfig.providers.s3.secretAccessKey,
        },
      })
    }

    // Initialize Google Cloud Storage
    if (storageConfig.providers.gcs.enabled) {
      this.gcsClient = new Storage({
        projectId: storageConfig.providers.gcs.projectId,
        keyFilename: storageConfig.providers.gcs.keyFilename,
      })

      this.gcsBucket = this.gcsClient.bucket(storageConfig.providers.gcs.bucket)
    }

    // Initialize Azure Blob Storage
    if (storageConfig.providers.azure.enabled) {
      this.azureClient = BlobServiceClient.fromConnectionString(
        `DefaultEndpointsProtocol=https;AccountName=${storageConfig.providers.azure.account};AccountKey=${storageConfig.providers.azure.accountKey};EndpointSuffix=core.windows.net`,
      )

      this.azureContainer = this.azureClient.getContainerClient(storageConfig.providers.azure.container)
    }
  }

  /**
   * Upload file
   * @param {Object} file - File object
   * @param {String} fileType - File type
   * @param {Object} options - Upload options
   * @param {Object} user - User object
   * @returns {Object} Uploaded file
   */
  async uploadFile(file, fileType, options = {}, user) {
    try {
      // Validate file type
      if (!storageConfig.fileTypes[fileType]) {
        throw new Error(`Invalid file type: ${fileType}`)
      }

      const fileTypeConfig = storageConfig.fileTypes[fileType]

      // Validate file extension
      const fileExt = path.extname(file.originalname).toLowerCase()

      if (!fileTypeConfig.extensions.includes(fileExt)) {
        throw new Error(
          `Invalid file extension: ${fileExt}. Allowed extensions: ${fileTypeConfig.extensions.join(", ")}`,
        )
      }

      // Validate file size
      if (file.size > fileTypeConfig.maxSize) {
        throw new Error(`File size exceeds the limit of ${fileTypeConfig.maxSize / (1024 * 1024)}MB`)
      }

      // Validate content type
      if (!fileTypeConfig.contentTypes.includes(file.mimetype)) {
        throw new Error(
          `Invalid content type: ${file.mimetype}. Allowed content types: ${fileTypeConfig.contentTypes.join(", ")}`,
        )
      }

      // Generate unique filename
      const filename = `${uuidv4()}${fileExt}`
      const filePath = path.join(fileTypeConfig.path, filename)

      // Process image if enabled and file is an image
      let processedFile = file.buffer
      let width, height

      if (storageConfig.imageProcessing.enabled && fileType === "image") {
        try {
          const image = sharp(file.buffer)
          const metadata = await image.metadata()

          width = metadata.width
          height = metadata.height

          // Resize image if specified in options
          if (options.resize && storageConfig.imageProcessing.resize[options.resize]) {
            const resizeConfig = storageConfig.imageProcessing.resize[options.resize]

            processedFile = await image
              .resize(resizeConfig.width, resizeConfig.height, { fit: resizeConfig.fit })
              .webp({ quality: storageConfig.imageProcessing.quality })
              .toBuffer()
          } else {
            // Convert to WebP without resizing
            processedFile = await image.webp({ quality: storageConfig.imageProcessing.quality }).toBuffer()
          }
        } catch (imageError) {
          console.error("Error processing image:", imageError)
          // Continue with original file if image processing fails
          processedFile = file.buffer
        }
      }

      // Upload file to storage provider
      const provider = options.provider || storageConfig.defaultProvider
      let fileUrl

      switch (provider) {
        case "local":
          fileUrl = await this.uploadToLocal(processedFile, filePath)
          break
        case "s3":
          fileUrl = await this.uploadToS3(processedFile, filePath, file.mimetype)
          break
        case "gcs":
          fileUrl = await this.uploadToGCS(processedFile, filePath, file.mimetype)
          break
        case "azure":
          fileUrl = await this.uploadToAzure(processedFile, filePath, file.mimetype)
          break
        default:
          throw new Error(`Unsupported storage provider: ${provider}`)
      }

      // Create file upload record
      const fileUpload = await FileUpload.create({
        id: uuidv4(),
        userId: user ? user.id : null,
        filename: file.originalname,
        fileSize: file.size,
        fileType,
        mimeType: file.mimetype,
        path: filePath,
        url: fileUrl,
        provider,
        width,
        height,
        metadata: options.metadata || {},
      })

      return {
        success: true,
        file: {
          id: fileUpload.id,
          filename: fileUpload.filename,
          url: fileUpload.url,
          fileType: fileUpload.fileType,
          fileSize: fileUpload.fileSize,
          width: fileUpload.width,
          height: fileUpload.height,
        },
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      throw error
    }
  }

  /**
   * Upload file to local storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {String} filePath - File path
   * @returns {String} File URL
   */
  async uploadToLocal(fileBuffer, filePath) {
    try {
      const localConfig = storageConfig.providers.local
      const fullPath = path.join(localConfig.basePath, filePath)
      const dirPath = path.dirname(fullPath)

      // Create directory if it doesn't exist
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
      }

      // Write file
      await promisify(fs.writeFile)(fullPath, fileBuffer)

      // Return file URL
      return `${localConfig.baseUrl}/${filePath.replace(/\\/g, "/")}`
    } catch (error) {
      console.error("Error uploading to local storage:", error)
      throw error
    }
  }

  /**
   * Upload file to S3
   * @param {Buffer} fileBuffer - File buffer
   * @param {String} filePath - File path
   * @param {String} contentType - Content type
   * @returns {String} File URL
   */
  async uploadToS3(fileBuffer, filePath, contentType) {
    try {
      const s3Config = storageConfig.providers.s3

      if (!this.s3Client) {
        throw new Error("S3 client is not initialized")
      }

      // Upload file
      const command = new PutObjectCommand({
        Bucket: s3Config.bucket,
        Key: filePath,
        Body: fileBuffer,
        ContentType: contentType,
        CacheControl: `max-age=${storageConfig.security.maxAge}`,
      })

      await this.s3Client.send(command)

      // Return file URL
      return `${s3Config.baseUrl}/${filePath}`
    } catch (error) {
      console.error("Error uploading to S3:", error)
      throw error
    }
  }

  /**
   * Upload file to Google Cloud Storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {String} filePath - File path
   * @param {String} contentType - Content type
   * @returns {String} File URL
   */
  async uploadToGCS(fileBuffer, filePath, contentType) {
    try {
      const gcsConfig = storageConfig.providers.gcs

      if (!this.gcsBucket) {
        throw new Error("GCS bucket is not initialized")
      }

      // Upload file
      const file = this.gcsBucket.file(filePath)

      await file.save(fileBuffer, {
        contentType,
        metadata: {
          cacheControl: `public, max-age=${storageConfig.security.maxAge}`,
        },
      })

      // Return file URL
      return `${gcsConfig.baseUrl}/${filePath}`
    } catch (error) {
      console.error("Error uploading to GCS:", error)
      throw error
    }
  }

  /**
   * Upload file to Azure Blob Storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {String} filePath - File path
   * @param {String} contentType - Content type
   * @returns {String} File URL
   */
  async uploadToAzure(fileBuffer, filePath, contentType) {
    try {
      const azureConfig = storageConfig.providers.azure

      if (!this.azureContainer) {
        throw new Error("Azure container is not initialized")
      }

      // Upload file
      const blockBlobClient = this.azureContainer.getBlockBlobClient(filePath)

      await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
        blobHTTPHeaders: {
          blobContentType: contentType,
          blobCacheControl: `max-age=${storageConfig.security.maxAge}`,
        },
      })

      // Return file URL
      return `${azureConfig.baseUrl}/${filePath}`
    } catch (error) {
      console.error("Error uploading to Azure:", error)
      throw error
    }
  }

  /**
   * Get file
   * @param {String} fileId - File ID
   * @returns {Object} File
   */
  async getFile(fileId) {
    try {
      const fileUpload = await FileUpload.findByPk(fileId)

      if (!fileUpload) {
        throw new Error("File not found")
      }

      // Generate signed URL if enabled
      let url = fileUpload.url

      if (storageConfig.security.signedUrls.enabled && fileUpload.provider !== "local") {
        url = await this.getSignedUrl(fileUpload)
      }

      return {
        success: true,
        file: {
          id: fileUpload.id,
          filename: fileUpload.filename,
          url,
          fileType: fileUpload.fileType,
          fileSize: fileUpload.fileSize,
          width: fileUpload.width,
          height: fileUpload.height,
          createdAt: fileUpload.createdAt,
        },
      }
    } catch (error) {
      console.error("Error getting file:", error)
      throw error
    }
  }

  /**
   * Get signed URL
   * @param {Object} fileUpload - File upload object
   * @returns {String} Signed URL
   */
  async getSignedUrl(fileUpload) {
    try {
      switch (fileUpload.provider) {
        case "s3":
          return await this.getS3SignedUrl(fileUpload.path)
        case "gcs":
          return await this.getGCSSignedUrl(fileUpload.path)
        case "azure":
          return await this.getAzureSignedUrl(fileUpload.path)
        default:
          return fileUpload.url
      }
    } catch (error) {
      console.error("Error getting signed URL:", error)
      return fileUpload.url
    }
  }

  /**
   * Get S3 signed URL
   * @param {String} filePath - File path
   * @returns {String} Signed URL
   */
  async getS3SignedUrl(filePath) {
    try {
      const s3Config = storageConfig.providers.s3

      if (!this.s3Client) {
        throw new Error("S3 client is not initialized")
      }

      const command = new GetObjectCommand({
        Bucket: s3Config.bucket,
        Key: filePath,
      })

      return await getSignedUrl(this.s3Client, command, {
        expiresIn: storageConfig.security.signedUrls.expiresIn,
      })
    } catch (error) {
      console.error("Error getting S3 signed URL:", error)
      throw error
    }
  }

  /**
   * Get GCS signed URL
   * @param {String} filePath - File path
   * @returns {String} Signed URL
   */
  async getGCSSignedUrl(filePath) {
    try {
      if (!this.gcsBucket) {
        throw new Error("GCS bucket is not initialized")
      }

      const file = this.gcsBucket.file(filePath)

      const [url] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + storageConfig.security.signedUrls.expiresIn * 1000,
      })

      return url
    } catch (error) {
      console.error("Error getting GCS signed URL:", error)
      throw error
    }
  }

  /**
   * Get Azure signed URL
   * @param {String} filePath - File path
   * @returns {String} Signed URL
   */
  async getAzureSignedUrl(filePath) {
    try {
      if (!this.azureContainer) {
        throw new Error("Azure container is not initialized")
      }

      const blockBlobClient = this.azureContainer.getBlockBlobClient(filePath)

      const sasToken = await blockBlobClient.generateSasUrl({
        permissions: "r",
        expiresOn: new Date(Date.now() + storageConfig.security.signedUrls.expiresIn * 1000),
      })

      return sasToken
    } catch (error) {
      console.error("Error getting Azure signed URL:", error)
      throw error
    }
  }

  /**
   * Delete file
   * @param {String} fileId - File ID
   * @param {Object} user - User object
   * @returns {Object} Result
   */
  async deleteFile(fileId, user) {
    try {
      const fileUpload = await FileUpload.findOne({
        where: { id: fileId, userId: user.id },
      })

      if (!fileUpload) {
        throw new Error("File not found or you do not have permission to delete it")
      }

      // Delete file from storage provider
      switch (fileUpload.provider) {
        case "local":
          await this.deleteFromLocal(fileUpload.path)
          break
        case "s3":
          await this.deleteFromS3(fileUpload.path)
          break
        case "gcs":
          await this.deleteFromGCS(fileUpload.path)
          break
        case "azure":
          await this.deleteFromAzure(fileUpload.path)
          break
        default:
          throw new Error(`Unsupported storage provider: ${fileUpload.provider}`)
      }

      // Delete file upload record
      await fileUpload.destroy()

      return {
        success: true,
        message: "File deleted successfully",
      }
    } catch (error) {
      console.error("Error deleting file:", error)
      throw error
    }
  }

  /**
   * Delete file from local storage
   * @param {String} filePath - File path
   */
  async deleteFromLocal(filePath) {
    try {
      const localConfig = storageConfig.providers.local
      const fullPath = path.join(localConfig.basePath, filePath)

      if (fs.existsSync(fullPath)) {
        await promisify(fs.unlink)(fullPath)
      }
    } catch (error) {
      console.error("Error deleting from local storage:", error)
      throw error
    }
  }

  /**
   * Delete file from S3
   * @param {String} filePath - File path
   */
  async deleteFromS3(filePath) {
    try {
      const s3Config = storageConfig.providers.s3

      if (!this.s3Client) {
        throw new Error("S3 client is not initialized")
      }

      const command = new DeleteObjectCommand({
        Bucket: s3Config.bucket,
        Key: filePath,
      })

      await this.s3Client.send(command)
    } catch (error) {
      console.error("Error deleting from S3:", error)
      throw error
    }
  }

  /**
   * Delete file from Google Cloud Storage
   * @param {String} filePath - File path
   */
  async deleteFromGCS(filePath) {
    try {
      if (!this.gcsBucket) {
        throw new Error("GCS bucket is not initialized")
      }

      const file = this.gcsBucket.file(filePath)
      await file.delete()
    } catch (error) {
      console.error("Error deleting from GCS:", error)
      throw error
    }
  }

  /**
   * Delete file from Azure Blob Storage
   * @param {String} filePath - File path
   */
  async deleteFromAzure(filePath) {
    try {
      if (!this.azureContainer) {
        throw new Error("Azure container is not initialized")
      }

      const blockBlobClient = this.azureContainer.getBlockBlobClient(filePath)
      await blockBlobClient.delete()
    } catch (error) {
      console.error("Error deleting from Azure:", error)
      throw error
    }
  }

  /**
   * Generate upload URL
   * @param {String} fileType - File type
   * @param {String} filename - Original filename
   * @param {Object} options - Upload options
   * @param {Object} user - User object
   * @returns {Object} Upload URL
   */
  async generateUploadUrl(fileType, filename, options = {}, user) {
    try {
      // Validate file type
      if (!storageConfig.fileTypes[fileType]) {
        throw new Error(`Invalid file type: ${fileType}`)
      }

      const fileTypeConfig = storageConfig.fileTypes[fileType]

      // Validate file extension
      const fileExt = path.extname(filename).toLowerCase()

      if (!fileTypeConfig.extensions.includes(fileExt)) {
        throw new Error(
          `Invalid file extension: ${fileExt}. Allowed extensions: ${fileTypeConfig.extensions.join(", ")}`,
        )
      }

      // Generate unique filename
      const newFilename = `${uuidv4()}${fileExt}`
      const filePath = path.join(fileTypeConfig.path, newFilename)

      // Generate upload URL based on provider
      const provider = options.provider || storageConfig.defaultProvider
      let uploadUrl, fileUrl

      switch (provider) {
        case "s3":
          ;({ uploadUrl, fileUrl } = await this.generateS3UploadUrl(filePath, fileTypeConfig.contentTypes))
          break
        case "gcs":
          ;({ uploadUrl, fileUrl } = await this.generateGCSUploadUrl(filePath, fileTypeConfig.contentTypes))
          break
        case "azure":
          ;({ uploadUrl, fileUrl } = await this.generateAzureUploadUrl(filePath, fileTypeConfig.contentTypes))
          break
        default:
          throw new Error(`Direct upload not supported for provider: ${provider}`)
      }

      // Create file upload record (will be updated after upload)
      const fileUpload = await FileUpload.create({
        id: uuidv4(),
        userId: user ? user.id : null,
        filename,
        fileSize: 0, // Will be updated after upload
        fileType,
        mimeType: "", // Will be updated after upload
        path: filePath,
        url: fileUrl,
        provider,
        metadata: options.metadata || {},
        status: "pending",
      })

      return {
        success: true,
        uploadUrl,
        fileUrl,
        fileId: fileUpload.id,
        fields: {
          key: filePath,
          "Content-Type": fileTypeConfig.contentTypes[0],
        },
      }
    } catch (error) {
      console.error("Error generating upload URL:", error)
      throw error
    }
  }

  /**
   * Generate S3 upload URL
   * @param {String} filePath - File path
   * @param {Array} contentTypes - Allowed content types
   * @returns {Object} Upload URL and file URL
   */
  async generateS3UploadUrl(filePath, contentTypes) {
    try {
      const s3Config = storageConfig.providers.s3

      if (!this.s3Client) {
        throw new Error("S3 client is not initialized")
      }

      const command = new PutObjectCommand({
        Bucket: s3Config.bucket,
        Key: filePath,
        ContentType: contentTypes[0],
        CacheControl: `max-age=${storageConfig.security.maxAge}`,
      })

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: storageConfig.security.signedUrls.expiresIn,
      })

      const fileUrl = `${s3Config.baseUrl}/${filePath}`

      return { uploadUrl, fileUrl }
    } catch (error) {
      console.error("Error generating S3 upload URL:", error)
      throw error
    }
  }

  /**
   * Generate GCS upload URL
   * @param {String} filePath - File path
   * @param {Array} contentTypes - Allowed content types
   * @returns {Object} Upload URL and file URL
   */
  async generateGCSUploadUrl(filePath, contentTypes) {
    try {
      const gcsConfig = storageConfig.providers.gcs

      if (!this.gcsBucket) {
        throw new Error("GCS bucket is not initialized")
      }

      const file = this.gcsBucket.file(filePath)

      const [uploadUrl] = await file.getSignedUrl({
        version: "v4",
        action: "write",
        expires: Date.now() + storageConfig.security.signedUrls.expiresIn * 1000,
        contentType: contentTypes[0],
        extensionHeaders: {
          "Cache-Control": `max-age=${storageConfig.security.maxAge}`,
        },
      })

      const fileUrl = `${gcsConfig.baseUrl}/${filePath}`

      return { uploadUrl, fileUrl }
    } catch (error) {
      console.error("Error generating GCS upload URL:", error)
      throw error
    }
  }

  /**
   * Generate Azure upload URL
   * @param {String} filePath - File path
   * @param {Array} contentTypes - Allowed content types
   * @returns {Object} Upload URL and file URL
   */
  async generateAzureUploadUrl(filePath, contentTypes) {
    try {
      const azureConfig = storageConfig.providers.azure

      if (!this.azureContainer) {
        throw new Error("Azure container is not initialized")
      }

      const blockBlobClient = this.azureContainer.getBlockBlobClient(filePath)

      const uploadUrl = await blockBlobClient.generateSasUrl({
        permissions: "w",
        expiresOn: new Date(Date.now() + storageConfig.security.signedUrls.expiresIn * 1000),
      })

      const fileUrl = `${azureConfig.baseUrl}/${filePath}`

      return { uploadUrl, fileUrl }
    } catch (error) {
      console.error("Error generating Azure upload URL:", error)
      throw error
    }
  }

  /**
   * Update file upload status
   * @param {String} fileId - File ID
   * @param {Object} updateData - Update data
   * @returns {Object} Updated file
   */
  async updateFileUpload(fileId, updateData) {
    try {
      const fileUpload = await FileUpload.findByPk(fileId)

      if (!fileUpload) {
        throw new Error("File not found")
      }

      // Update file upload record
      await fileUpload.update({
        fileSize: updateData.fileSize || fileUpload.fileSize,
        mimeType: updateData.mimeType || fileUpload.mimeType,
        width: updateData.width || fileUpload.width,
        height: updateData.height || fileUpload.height,
        status: updateData.status || "completed",
        metadata: { ...fileUpload.metadata, ...updateData.metadata },
      })

      return {
        success: true,
        file: {
          id: fileUpload.id,
          filename: fileUpload.filename,
          url: fileUpload.url,
          fileType: fileUpload.fileType,
          fileSize: fileUpload.fileSize,
          width: fileUpload.width,
          height: fileUpload.height,
        },
      }
    } catch (error) {
      console.error("Error updating file upload:", error)
      throw error
    }
  }
}

module.exports = new StorageService()
