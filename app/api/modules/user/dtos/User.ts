export type User = {
  id: number;
  name: string;
  birthDate: Date;
  document?: string;
  city?: string;
  neighborhood?: string;
  address?: string;
  planKind?: 'monthly' | 'quarterly' | 'annual';
}