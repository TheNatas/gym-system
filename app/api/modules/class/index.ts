import { GetListProps } from "../../types/GetListProps";
import { User } from "../user/dtos/User";
import { randomDelay } from "../../delay";
import { Class } from "./dtos/Class"

type GetClassesByDayProps = GetListProps & {
  date?: Date;
};

export const getClassesByDay = async ({
    date = new Date(), 
    page = 1, 
    pageSize = 10 
  } : GetClassesByDayProps = {}
) : Promise<{ total: number; items: Class[] }> => {
  await randomDelay();
  const classes = localStorage.getItem("classes") ? JSON.parse(localStorage.getItem("classes")!) : [];

  const filteredClasses = classes.filter((c: Class) => {
    const classDate = new Date(c.date);
    return (
      classDate.getFullYear() === date.getFullYear() &&
      classDate.getMonth() === date.getMonth() &&
      classDate.getDate() === date.getDate()
    );
  }).sort((a: Class, b: Class) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    total: filteredClasses.length,
    items: filteredClasses.slice((page - 1) * pageSize, page * pageSize)
  };
};

export const saveClass = async (gymClass: Class) : Promise<Class> => {
  await randomDelay();
  if (!gymClass.id) {
    gymClass.id = Date.now();
    gymClass.users = [];
  
    const classes = localStorage.getItem("classes") ? JSON.parse(localStorage.getItem("classes")!) : [];
    classes.push(gymClass);
    localStorage.setItem("classes", JSON.stringify(classes));
  } else {
    const classes = localStorage.getItem("classes") ? JSON.parse(localStorage.getItem("classes")!) : [];

    const classIndex = classes.findIndex((c: Class) => c.id === gymClass.id);
    if (classIndex !== -1) {
      if (!gymClass.users) {
        gymClass.users = classes[classIndex].users || [];
      }
      classes[classIndex] = gymClass;
      localStorage.setItem("classes", JSON.stringify(classes));
    }
  }

  return gymClass;
}
export const getClass = async (id: number) : Promise<Class | undefined> => {
  await randomDelay();
  const classes = localStorage.getItem("classes") ? JSON.parse(localStorage.getItem("classes")!) : [];
  return classes.find((c: Class) => c.id === id);
}

export const addParticipant = async (classId: number, user: User): Promise<{ success: boolean; message?: string }> => {
  await randomDelay();
  const classes = localStorage.getItem("classes") ? JSON.parse(localStorage.getItem("classes")!) : [];
  const classIndex = classes.findIndex((c: Class) => c.id === classId);

  if (classIndex === -1) return { success: false, message: "Aula não encontrada" };

  const gymClass = classes[classIndex];
  const currentParticipants = gymClass.users ? gymClass.users.length : 0;

  if (currentParticipants >= gymClass.numberOfParticipants) {
    return { success: false, message: "A aula está cheia" };
  }

  if (gymClass.status === 'completed') {
    return { success: false, message: "A aula já foi concluída" };
  }

  const now = new Date();
  const classDate = new Date(gymClass.date);
  if (now > classDate && !gymClass.allowBookingAfterStart) {
    return { success: false, message: "Agendamento não permitido após o início da aula" };
  }

  if (!gymClass.users) gymClass.users = [];
  
  if (gymClass.users.find((u: User) => u.id === user.id)) {
      return { success: false, message: "Usuário já cadastrado" };
  }

  gymClass.users.push(user);
  classes[classIndex] = gymClass;
  localStorage.setItem("classes", JSON.stringify(classes));

  return { success: true };
};

export const removeParticipant = async (classId: number, userId: number): Promise<void> => {
  await randomDelay();
  const classes = localStorage.getItem("classes") ? JSON.parse(localStorage.getItem("classes")!) : [];
  const classIndex = classes.findIndex((c: Class) => c.id === classId);

  if (classIndex !== -1) {
    const gymClass = classes[classIndex];
    if (gymClass.users) {
      gymClass.users = gymClass.users.filter((u: User) => u.id !== userId);
      classes[classIndex] = gymClass;
      localStorage.setItem("classes", JSON.stringify(classes));
    }
  }
};

export const finishClass = async (classId: number): Promise<void> => {
  const classes = localStorage.getItem("classes") ? JSON.parse(localStorage.getItem("classes")!) : [];
  const classIndex = classes.findIndex((c: Class) => c.id === classId);

  if (classIndex !== -1) {
    classes[classIndex].status = 'completed';
    localStorage.setItem("classes", JSON.stringify(classes));
  }
};