// interfaces.ts

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  email: string;
  lawnSize: string;
  visits: Visit[];
  image: string; // Add image property
  selected?: string; // Change the selected property to string
  tags: { day: string; occurrence: string }[]; // Add tags property
  schedule?: Schedule; // Add schedule property
}

export interface Visit {
  date: string;
  paid: boolean;
  complete: boolean; // Added property
  charge: number;     // Added property
}

export interface Schedule {
  frequency: string;
  nextServiceDate: string | null; // Updated to allow null
  lastServiceDate?: string;
}
