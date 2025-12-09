import { User } from "../../user/dtos/User";

export type Class = {
  id: number;
  description: string;
  kind: 'Cross' | 'Functional' | 'Pilates';
  date: Date;
  numberOfParticipants: number;
  status: 'open' | 'completed';
  allowBookingAfterStart: boolean;
  users?: User[];
}
