// config/storage.config.js
module.exports = {
  // Default storage provider
  defaultProvider: process.env.STORAGE_PROVIDER || "local",

  // Storage providers
  providers: {
    local: {
      enabled: true,
      basePath: process.env.LOCAL_STORAGE_PATH || "./uploads",
      baseUrl: process.env.LOCAL_STORAGE_URL || `${process.env.BASE_URL}/uploads`,
      createPath: true,
    },
    s3: {
      enabled: process.env.AWS_S3_BUCKET ? true : false,
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_REGION || "us-east-1",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      baseUrl:
        process.env.AWS_S3_BASE_URL ||
        `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com`,
    },
    gcs: {
      enabled: process.env.GCS_BUCKET ? true : false,
      bucket: process.env.GCS_BUCKET,
      projectId: process.env.GCS_PROJECT_ID,
      keyFilename: process.env.GCS_KEY_FILE,
      baseUrl: process.env.GCS_BASE_URL || `https://storage.googleapis.com/${process.env.GCS_BUCKET}`,
    },
    azure: {
      enabled: process.env.AZURE_STORAGE_ACCOUNT ? true : false,
      account: process.env.AZURE_STORAGE_ACCOUNT,
      accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY,
      container: process.env.AZURE_STORAGE_CONTAINER,
      baseUrl:
        process.env.AZURE_STORAGE_BASE_URL ||
        `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${process.env.AZURE_STORAGE_CONTAINER}`,
    },
  },

  // File types
  fileTypes: {
    image: {
      extensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
      maxSize: 5 * 1024 * 1024, // 5MB
      path: "images",
      contentTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    },
    document: {
      extensions: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"],
      maxSize: 10 * 1024 * 1024, // 10MB
      path: "documents",
      contentTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ],
    },
    verification: {
      extensions: [".jpg", ".jpeg", ".png", ".pdf"],
      maxSize: 10 * 1024 * 1024, // 10MB
      path: "verification",
      contentTypes: ["image/jpeg", "image/png", "application/pdf"],
    },
  },

  // Image processing
  imageProcessing: {
    enabled: true,
    resize: {
      thumbnail: { width: 150, height: 150, fit: "cover" },
      small: { width: 300, height: 300, fit: "inside" },
      medium: { width: 600, height: 600, fit: "inside" },
      large: { width: 1200, height: 1200, fit: "inside" },
    },
    quality: 80,
    format: "webp",
  },

  // Security
  security: {
    allowedOrigins: ["*"],
    maxAge: 31536000, // 1 year in seconds
    signedUrls: {
      enabled: true,
      expiresIn: 3600, // 1 hour in seconds
    },
  },
}
