export interface ScannerService {
  scanFront(): Promise<string>;
  scanBack(): Promise<string>;
}

// TODO: Implement ScannerService (e.g., integrating expo-image-picker or a custom camera module)