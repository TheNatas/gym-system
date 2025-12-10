import { saveUser } from "@/app/api/modules/user";
import { NewUser } from "@/app/api/modules/user/dtos/NewUser";
import { User } from "@/app/api/modules/user/dtos/User";
import { FormField } from "@/app/components/FormComponent";
import { Dispatch, SetStateAction, useState } from "react";
import z from "zod";

const getUserSchema = (isEditing: boolean) => {
  const maxDate = new Date();
  maxDate.setHours(23, 59, 59, 999);

  return z.object({
    id: isEditing ? z.number() : z.number().optional(),
    name: z.string().min(1, 'O nome é obrigatório').max(40, 'O nome é muito longo'),
    birthDate: z.coerce.date().max(maxDate, 'A data de nascimento não pode ser no futuro'),
    document: z.string().max(11, 'O CPF deve ter no máximo 11 dígitos').optional(),
    city: z.string().max(40, 'O nome da cidade é muito longo').optional(),
    neighborhood: z.string().max(40, 'O nome do bairro é muito longo').optional(),
    address: z.string().max(100, 'O endereço é muito longo').optional(),
    planKind: z.enum(['monthly', 'quarterly', 'annual'])
  });
};

const userFormFields: FormField<User | NewUser>[] = [
  { name: 'name', label: 'Nome' },
  { name: 'birthDate', label: 'Data de Nascimento', type: 'date' },
  { name: 'document', label: 'CPF (apenas números)' },
  { name: 'city', label: 'Cidade' },
  { name: 'neighborhood', label: 'Bairro' },
  { name: 'address', label: 'Endereço' },
  {
    name: 'planKind',
    label: 'Tipo de Plano',
    type: 'select',
    options: [
      { value: 'monthly', label: 'Mensal' },
      { value: 'quarterly', label: 'Trimestral' },
      { value: 'annual', label: 'Anual' },
    ],
  },
];

type UseUserFormProps = {
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  fetchUsers: (params?: { page?: number; search?: string; append?: boolean } | number) => Promise<{ total: number; items: User[]; }>;
}

export const useUserForm = ({ users, setUsers, fetchUsers } : UseUserFormProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

  const handleCreateUser = () => {
    setEditingUser(undefined);
    setIsFormOpen(true);
  };

  const handleEditUser = (id: string | number) => {
    const userToEdit = users.find((u) => u.id === id);
    if (userToEdit) {
      setEditingUser(userToEdit);
      setIsFormOpen(true);
    }
  };

  const handleSaveUser = async (data: User | NewUser) => {
    const userToSave = { ...data, id: editingUser?.id || 0 };
    
    const previousUsers = [...users];
    setIsFormOpen(false);

    // Optimistic Update
    if (userToSave.id) {
      setUsers((prev) => prev.map((u) => (u.id === userToSave.id ? (userToSave as User) : u)));
    } else {
      const tempUser = { ...userToSave, id: Date.now() } as User;
      setUsers((prev) => [...prev, tempUser]);
    }

    try {
      await saveUser(userToSave);
      await fetchUsers();
    } catch (error) {
      console.error("Failed to save user", error);
      setUsers(previousUsers);
    }
  };

  return {
    isFormOpen,
    setIsFormOpen,
    editingUser,
    handleCreateUser,
    handleEditUser,
    handleSaveUser,
    getUserSchema,
    userFormFields,
  };
}