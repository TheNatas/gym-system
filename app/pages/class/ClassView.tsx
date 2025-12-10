'use client';

import React, { useState } from 'react';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import CalendarDayView from '../../components/CalendarDayView';
import FormComponent from '../../components/FormComponent';
import ClassDetails from './ClassDetails';
import { useClasses } from './hooks/useClasses';
import { useUserSearch } from './hooks/useUserSearch';
import { User } from '@/app/api/modules/user/dtos/User';

export default function ClassView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const { 
    users: usersList, 
    loading: loadingUsers, 
    setSearchValue: setUserSearchValue, 
    loadMore: handleLoadMoreUsers,
    resetSearch: resetUserSearch
  } = useUserSearch();
  
  const [selectedParticipant, setSelectedParticipant] = useState<User | null>(null);
  const [participantError, setParticipantError] = useState<string | null>(null);

  const { 
    classes, 
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
    getClassSchema,
    classFormFields,
    handleAddParticipant,
    handleRemoveParticipant,
    handleFinishClass,
    loadMore,
    hasMore,
    loading
  } = useClasses({ selectedDate, pageSize: 10 });

  React.useEffect(() => {
    if (isDetailsOpen) {
      resetUserSearch();
      setSelectedParticipant(null);
      setParticipantError(null);
    }
  }, [isDetailsOpen, resetUserSearch]);

  const onAddParticipant = async () => {
    if (!selectedParticipant) return;
    
    const result = await handleAddParticipant(selectedParticipant);
    if (result.success) {
      setSelectedParticipant(null);
      setParticipantError(null);
    } else {
      setParticipantError(result.message || "Failed to add participant");
    }
  };

  const toYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4, alignItems: 'stretch' }}>
        <TextField
          label="Filtrar por Data"
          type="date"
          value={toYYYYMMDD(selectedDate)}
          onChange={(e) => {
            if (!e.target.value) return;
            const [y, m, d] = e.target.value.split('-').map(Number);
            setSelectedDate(new Date(y, m - 1, d));
          }}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClass}
          fullWidth
        >
          Adicionar Nova Aula
        </Button>
      </Box>

      <CalendarDayView
        classes={classes}
        onClassClick={handleClassClick}
        onLoadMore={loadMore}
        hasMore={hasMore}
        loading={loading}
      />

      <FormComponent
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingClass ? 'Editar Aula' : 'Nova Aula'}
        schema={getClassSchema(!!editingClass)}
        defaultValues={editingClass || {
          description: '',
          kind: 'Cross',
          date: new Date(),
          numberOfParticipants: 10,
          status: 'open',
          allowBookingAfterStart: false,
        }}
        onSubmit={handleSaveClass}
        fields={classFormFields}
      />

      <ClassDetails
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        gymClass={selectedClass}
        onEdit={handleEditClass}
        onAddParticipant={onAddParticipant}
        onRemoveParticipant={handleRemoveParticipant}
        onFinishClass={handleFinishClass}
        usersList={usersList}
        selectedParticipant={selectedParticipant}
        onSelectParticipant={setSelectedParticipant}
        participantError={participantError}
        loadingUsers={loadingUsers}
        onUserSearchInputChange={setUserSearchValue}
        onLoadMoreUsers={handleLoadMoreUsers}
      />
    </>
  );
}
