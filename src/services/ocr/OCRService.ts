export interface OCRService {
  extractText(imageUri: string): Promise<string>;
}

// TODO: Implement OCRService (e.g., integrating Google Cloud Vision, AWS Textract, or a local ML model)