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
    tags: { day: string, occurrence: string }[]; // Add tags property
  }
  
  /**
   * Represents a visit.
   * @property {string} date - The date of the visit.
   * @property {boolean} paid - Indicates if the visit has been paid.
   */
export interface Visit {
    date: string;
    paid: boolean;
  }