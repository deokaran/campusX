export interface Notice {
  date: string; // YYYY-MM-DD
  title: string;
  category: 'Administrative' | 'Academic' | 'Event' | 'Other';
  content?: string; // Optional detailed content
}
