import { Address } from "./address.model";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  addresses: Address[];
}
