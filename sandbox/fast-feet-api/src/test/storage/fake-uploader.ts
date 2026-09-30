import { UploadParams, Uploader } from '@/domain/storage/uploader.js'
import { randomUUID } from 'node:crypto'

interface Upload {
  fileName: string
  url: string
}

export class FakeUploader implements Uploader {
  public uploads: Upload[] = []

  async upload({ fileName }: UploadParams): Promise<{ url: string }> {
    const url = randomUUID()

    this.uploads.push({
      fileName,
      url,
    })

    return { url }
  }

  async getFileUrl(key: string): Promise<string> {
    return `http://fake-url.com/${key}`
  }
}
