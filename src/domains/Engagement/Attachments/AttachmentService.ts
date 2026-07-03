import { prisma } from "@/lib/prisma";

export interface FileData {
  fileUrl: string;
  fileType: string;
  fileName: string;
  fileSize: number;
}

export class AttachmentService {
  /**
   * Mock implementation of a file upload.
   * In a real enterprise app, this would stream to S3, Google Cloud Storage, or UploadThing.
   */
  static async uploadFile(file: File): Promise<FileData> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Return a mock URL
    return {
      fileUrl: `https://storage.novasphere.com/mock/${file.name}`,
      fileType: file.type || "application/octet-stream",
      fileName: file.name,
      fileSize: file.size,
    };
  }

  /**
   * Persists the attachment record in the database linked to a specific message.
   */
  static async createAttachmentRecord(messageId: string, data: FileData) {
    return await prisma.conversationAttachment.create({
      data: {
        messageId,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileName: data.fileName,
        fileSize: data.fileSize,
      },
    });
  }
}
