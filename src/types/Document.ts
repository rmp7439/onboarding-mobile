export interface DocumentItem {
  id: string;
  title: string;
  uri: string | null;
  filename: string | null;
  required?: boolean;
}