'use client';

import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { Class } from '../../api/modules/class/dtos/Class';
import { User } from '../../api/modules/user/dtos/User';

type ClassDetailsProps = {
  open: boolean;
  onClose: () => void;
  gymClass: Class | undefined;
  onEdit: () => void;
  onAddParticipant: () => Promise<void>;
  onRemoveParticipant: (userId: number) => Promise<void>;
  onFinishClass: () => Promise<void>;
  
  // User Search Props
  usersList: User[];
  selectedParticipant: User | null;
  onSelectParticipant: (user: User | null) => void;
  participantError: string | null;
  loadingUsers: boolean;
  onUserSearchInputChange: (value: string) => void;
  onLoadMoreUsers: () => void;
}

export default function ClassDetails({ 
  open, 
  onClose, 
  gymClass, 
  onEdit, 
  onAddParticipant,
  onRemoveParticipant,
  onFinishClass,
  usersList,
  selectedParticipant,
  onSelectParticipant,
  participantError,
  loadingUsers,
  onUserSearchInputChange,
  onLoadMoreUsers
}: ClassDetailsProps) {
  if (!gymClass) return null;

  const handleRemoveParticipant = async (userId: number) => {
    await onRemoveParticipant(userId);
  };

  const handleFinishClass = async () => {
    await onFinishClass();
  };

  const participants = gymClass.users || [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {gymClass.description} ({gymClass.kind})
        <Typography variant="subtitle2" color="text.secondary" component="div">
          {new Date(gymClass.date).toLocaleString()} - {gymClass.status.toUpperCase()}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Participantes ({participants.length}/{gymClass.numberOfParticipants})</Typography>
          <List dense>
            {participants.map((user) => (
              <ListItem
                key={user.id}
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveParticipant(user.id)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={user.name} secondary={user.planKind} />
              </ListItem>
            ))}
            {participants.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Nenhum participante ainda.
              </Typography>
            )}
          </List>
        </Box>

        {participantError && <Alert severity="error" sx={{ mb: 2 }}>{participantError}</Alert>}

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Autocomplete
            options={usersList}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => {
                return (
                    <li {...props} key={option.id}>
                        {option.name}
                    </li>
                );
            }}
            value={selectedParticipant}
            onChange={(event, newValue) => onSelectParticipant(newValue)}
            onInputChange={(event, newInputValue) => {
                onUserSearchInputChange(newInputValue);
            }}
            ListboxProps={{
                onScroll: (event: React.SyntheticEvent) => {
                    const listboxNode = event.currentTarget;
                    if (listboxNode.scrollTop + listboxNode.clientHeight >= listboxNode.scrollHeight - 20) {
                        onLoadMoreUsers();
                    }
                }
            }}
            loading={loadingUsers}
            renderInput={(params) => (
                <TextField 
                    {...params} 
                    label="Adicionar Participante" 
                    size="small" 
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
            sx={{ flexGrow: 1 }}
          />
          <Button variant="contained" onClick={onAddParticipant} disabled={!selectedParticipant}>
            Adicionar
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
        <Button onClick={onEdit} color="primary">Editar Aula</Button>
        {gymClass.status !== 'completed' && (
          <Button onClick={handleFinishClass} color="warning">
            Finalizar Aula
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
