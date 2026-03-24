export interface StoredLog {
  id: string;
  timestamp: string;
  level: string;
  service: string;
  message: string;
  metadata: string;
  isDuplicate: boolean;
  ingestedAt: string;
}
