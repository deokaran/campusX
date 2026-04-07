export interface Department {
  id?: string; // Frontend compatibility
  _id?: string; // Backend MongoDB ID
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: string;
}
