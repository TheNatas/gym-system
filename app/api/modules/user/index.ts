import { GetListProps } from "../../types/GetListProps";
import { randomDelay } from "../../utils/delay";
import { User } from "./dtos/User"

export const getUsers = async (
  { page = 1, pageSize = 10, search = "" } : GetListProps
) : Promise<{ total: number; items: User[] }> => {
  await randomDelay();
  const lsUsers = localStorage.getItem("users");
  let users = lsUsers ? JSON.parse(lsUsers) : [];

  if (search) {
    const lowerSearch = (search as string).toLowerCase();
    users = users.filter((u: User) => u.name.toLowerCase().includes(lowerSearch));
  }

  return {
    total: users.length, 
    items: users.slice((page - 1) * pageSize, page * pageSize)
  };
};

export const saveUser = async (user: User) : Promise<User> => {
  await randomDelay();
  if (!user.id) {
    user.id = Date.now();
  
    const users = localStorage.getItem("users") ? JSON.parse(localStorage.getItem("users")!) : [];
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
  } else {
    const users = localStorage.getItem("users") ? JSON.parse(localStorage.getItem("users")!) : [];

    const userIndex = users.findIndex((u: User) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = user;
      localStorage.setItem("users", JSON.stringify(users));
    }
  }

  return user;
}