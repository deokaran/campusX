export interface Notice {
  _id?: string; // MongoDB ID from backend
  date: string; // YYYY-MM-DD
  title: string;
  category: 'Administrative' | 'Academic' | 'Event' | 'Other';
  description: string; // Notice description/content
}
