'use client';

import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import ListComponent from '../../components/ListComponent';
import FormComponent from '../../components/FormComponent';
import { useUsersList } from './hooks/useUsersList';
import { useUserForm } from './hooks/useUserForm';
import { useState } from 'react';

export default function UserView() {
  const { total, users, fetchUsers, setUsers, loading, fullLoading, silentLoading } = useUsersList();
  const { 
    isFormOpen, 
    setIsFormOpen, 
    editingUser, 
    handleCreateUser, 
    handleEditUser, 
    handleSaveUser,
    getUserSchema,
    userFormFields
  } = useUserForm({ users, setUsers, fetchUsers });

  const [page, setPage] = useState<number>(1);

  const handlePageChange = async (newPage : number) => {
    setPage(newPage);
    await fetchUsers({ page: newPage });
  };

  const listItems = users.map((user) => ({
    id: user.id,
    primary: user.name,
    secondary: `${user.planKind ? user.planKind + ' plano' : 'Sem plano'} ${user.city ? '— ' + user.city : ''}`,
  }));

  return (
    <>
      <Button 
        variant="contained" 
        startIcon={<AddIcon />} 
        onClick={handleCreateUser}
        sx={{ mb: 4 }}
        fullWidth
      >
        Adicionar Novo Usuário
      </Button>

      <ListComponent 
        title="Usuários Cadastrados" 
        items={listItems} 
        onItemClick={handleEditUser}
        total={total}
        page={page}
        onPageChange={handlePageChange}
        loading={loading}
        fullLoading={fullLoading}
        silentLoading={silentLoading}
      />

      <FormComponent
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
        schema={getUserSchema(!!editingUser)}
        defaultValues={editingUser || {
            name: '',
            birthDate: new Date(),
            document: '',
            city: '',
            neighborhood: '',
            address: '',
            planKind: 'monthly'
        }}
        onSubmit={handleSaveUser}
        fields={userFormFields}
      />
    </>
  );
}
