// interfaces.ts

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber: string;
  email: string;
  lawnSize: string;
  visits: Visit[];
  image: string; // Add image property
  selected?: string; // Change the selected property to string
  tags: { day: string; occurrence: string }[]; // Add tags property
  schedule?: Schedule; // Add schedule property
  properties?: Property[];
}

export interface Property {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Visit {
  date: string;
  paid: boolean;
  complete: boolean; // Added property
  charge: number; // Added property
}

// export interface Schedule {
//   frequency: string;
//   nextServiceDate: string | null; // Updated to allow null
//   lastServiceDate?: string;
// }

export interface ClientData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  properties: Property_list[];
}
export interface Schedule {
  frequency: string;
  nextDate: string;
  service: string;
  cost: number;
}

export interface Property_list {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  schedules: Schedule[];
}

export interface Job {
  id: number;
  jobDate: string;
  status: string;
  cost: number;
  property: {
    id: number;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  schedule: {
    id: number;
    frequency: string;
    service: string;
  };
  client: {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  };
}

export interface Company {
  name: string;
  image: string;
  level: string;
}

export interface Schedule {
  id: number;
  frequency: string;
  service: string;
  cost: number;
  nextDate: string;
  endDate: string;
  isActive: boolean;
  jobs: {
    id: number;
    jobDate: string;
    status: string;
    cost: number;
  }[];
}
[];
