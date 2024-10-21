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
  schedule?: Schedule; // Add schedule property
}

export interface Visit {
  date: string;
  paid: boolean;
  payment: Payment; // Add payment property
}

/**
 * Represents a payment.
 * @property {number} amount - The amount paid.
 * @property {boolean} paid - Indicates if the payment has been made.
 * @property {'Cash' | 'Online' | 'Check' | 'Card'} method - The method of payment.
 * @property {string} [platform] - The platform used for online payments (e.g., "PayPal", "Stripe").
 */
export interface Payment {
  amount: number;
  paid: boolean;
  method: string;
  platform?: string; // e.g., "PayPal", "Stripe" if method is online
}


export interface Schedule {
  frequency: string;
  nextServiceDate: string;
  lastServiceDate?: string;
}