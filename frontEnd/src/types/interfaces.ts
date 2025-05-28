// interfaces.ts
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
export interface ClientDataID {
  id: number;
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

export interface PropertyWithID {
  id: number;
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

export interface ClientSchedule {
  id: number;
  frequency: string;
  service: string;
  cost: number;
  nextDate: string;
  endDate: string | null; // Updated to allow null
  isActive: boolean;
  jobs: {
    id: number;
    jobDate: string;
    status: string;
    cost: number;
  }[];
}
[];
