import { User } from "./User";

export type NewUser = Omit<User, 'id'>;