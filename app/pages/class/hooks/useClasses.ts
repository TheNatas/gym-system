import { saveClass, addParticipant, removeParticipant, finishClass } from "@/app/api/modules/class";
import { Class } from "@/app/api/modules/class/dtos/Class";
import { NewClass } from "@/app/api/modules/class/dtos/NewClass";
import { User } from "@/app/api/modules/user/dtos/User";
import { FormField } from "@/app/components/FormComponent";
import { useCallback, useEffect, useState } from "react";
import z from "zod";
import { useClassContext } from "@/app/context/ClassContext";

const getClassSchema = (isEditingClass: boolean) => {
  return z.object({
    id: isEditingClass ? z.number() : z.number().optional(),
    description: z.string().min(1, 'A descrição é obrigatória').max(400, 'A descrição é muito longa'),
    kind: z.enum(['Cross', 'Functional', 'Pilates']),
    date: z.coerce.date(),
    numberOfParticipants: z.number().min(1, 'Pelo menos 1 participante'),
    status: z.enum(['open', 'completed']),
    allowBookingAfterStart: z.boolean(),
  });
};

const classFormFields: FormField<Class | NewClass>[] = [
  { name: 'description', label: 'Descrição' },
  {
    name: 'kind',
    label: 'Tipo',
    type: 'select',
    options: [
      { value: 'Cross', label: 'Cross' },
      { value: 'Functional', label: 'Funcional' },
      { value: 'Pilates', label: 'Pilates' },
    ],
  },
  { name: 'date', label: 'Data & Hora', type: 'datetime-local' },
  { name: 'numberOfParticipants', label: 'Máx Participantes', type: 'number' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'open', label: 'Aberta' },
      { value: 'completed', label: 'Concluída' },
    ],
  },
  { name: 'allowBookingAfterStart', label: 'Permitir Agendamento Após Início', type: 'checkbox' },
];

export const useClasses = ({ pageSize = 10 }: { pageSize?: number } = {}) => {
  const { 
    classes, 
    total, 
    page, 
    hasMore, 
    loading, 
    fullLoading,
    silentLoading,
    selectedDate, 
    fetchClasses, 
    setClasses, 
    setPage, 
    selectedClass, 
    setSelectedClass 
  } = useClassContext();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | undefined>(undefined);

  useEffect(() => {
    if (classes.length === 0) {
        fetchClasses({ page: 1, size: pageSize, append: false, silent: false });
    }
  }, [fetchClasses, pageSize, classes.length]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchClasses({ page: nextPage, size: pageSize, append: true, silent: true });
    }
  }, [loading, hasMore, page, pageSize, fetchClasses, setPage]);

  const handleCreateClass = () => {
    setEditingClass(undefined);
    setIsFormOpen(true);
  };

  const handleClassClick = (id: string | number) => {
    const classToView = classes.find((c) => c.id === id);
    if (classToView) {
      setSelectedClass(classToView);
      setIsDetailsOpen(true);
    }
  };

  const handleEditClass = () => {
    setEditingClass(selectedClass);
    setIsDetailsOpen(false);
    setIsFormOpen(true);
  };

  const handleSaveClass = async (data: Class | NewClass) => {
    const classToSave = { ...data, id: editingClass?.id || 0 };
    
    const previousClasses = [...classes];
    const previousSelectedClass = selectedClass;
    setIsFormOpen(false);

    // Optimistic Update
    if (classToSave.id) {
      setClasses((prev) => prev.map((c) => (c.id === classToSave.id ? (classToSave as Class) : c)));
      if (selectedClass?.id === classToSave.id) {
        setSelectedClass(classToSave as Class);
      }
    } else {
      const tempClass = { ...classToSave, id: Date.now() } as Class;
      setClasses((prev) => [...prev, tempClass]);
    }

    try {
      await saveClass(classToSave);
      await fetchClasses({ page: 1, size: pageSize, append: false, silent: true });
    } catch (error) {
      console.error("Failed to save class", error);
      setClasses(previousClasses);
      if (previousSelectedClass) {
        setSelectedClass(previousSelectedClass);
      }
    }
  };

  const handleAddParticipant = async (user: User) => {
    if (!selectedClass) return { success: false, message: "No class selected" };
    
    const previousSelectedClass = selectedClass;
    const previousClasses = [...classes];

    // Optimistic update
    const updatedClass = { 
        ...selectedClass, 
        users: [...(selectedClass.users || []), user] 
    };
    setSelectedClass(updatedClass);
    setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));

    const result = await addParticipant(selectedClass.id, user);
    if (!result.success) {
        setSelectedClass(previousSelectedClass);
        setClasses(previousClasses);
    }
    return result;
  };

  const handleRemoveParticipant = async (userId: number) => {
    if (!selectedClass) return;

    const previousSelectedClass = selectedClass;
    const previousClasses = [...classes];

    // Optimistic update
    const updatedClass = {
        ...selectedClass,
        users: (selectedClass.users || []).filter(u => u.id !== userId)
    };
    setSelectedClass(updatedClass);
    setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));

    try {
        await removeParticipant(selectedClass.id, userId);
    } catch (error) {
      console.error("Failed to remove participant", error);
      setSelectedClass(previousSelectedClass);
      setClasses(previousClasses);
    }
  };

  const handleFinishClass = async () => {
    if (!selectedClass) return;

    const previousSelectedClass = selectedClass;
    const previousClasses = [...classes];

    // Optimistic update
    const updatedClass = { ...selectedClass, status: 'completed' as const };
    setSelectedClass(updatedClass);
    setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));

    try {
        await finishClass(selectedClass.id);
    } catch (error) {
      console.error("Failed to finish class", error);
      setSelectedClass(previousSelectedClass);
      setClasses(previousClasses);
    }
  };

  return {
    classes,
    total,
    isFormOpen,
    setIsFormOpen,
    isDetailsOpen,
    setIsDetailsOpen,
    editingClass,
    selectedClass,
    handleCreateClass,
    handleClassClick,
    handleEditClass,
    handleSaveClass,
    fetchClasses,
    getClassSchema,
    classFormFields,
    handleAddParticipant,
    handleRemoveParticipant,
    handleFinishClass,
    loadMore,
    hasMore,
    loading,
    fullLoading,
    silentLoading,
    selectedDate
  };
}