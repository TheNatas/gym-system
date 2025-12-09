'use client';

import React from 'react';
import { useForm, FieldValues, DefaultValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { FormCheckbox } from './inputs/FormCheckbox';
import { FormSelect } from './inputs/FormSelect';
import { FormTextField } from './inputs/FormTextField';

export interface FormField<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type?: 'text' | 'number' | 'date' | 'datetime-local' | 'select' | 'checkbox';
  options?: { value: string | number; label: string }[];
}

interface FormComponentProps<T extends FieldValues> {
  open: boolean;
  onClose: () => void;
  title: string;
  schema: ZodSchema<T>;
  defaultValues?: DefaultValues<T>;
  onSubmit: (data: T) => void;
  fields: FormField<T>[];
}

export default function FormComponent<T extends FieldValues>({
  open,
  onClose,
  title,
  schema,
  defaultValues,
  onSubmit,
  fields,
}: FormComponentProps<T>) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  // Reset form when defaultValues change or dialog opens
  React.useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const handleFormSubmit = (data: T) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {fields.map((field) => {
              if (field.type === 'checkbox') {
                return (
                  <FormCheckbox
                    key={field.name}
                    name={field.name}
                    control={control}
                    label={field.label}
                  />
                );
              }

              if (field.type === 'select') {
                return (
                  <FormSelect
                    key={field.name}
                    name={field.name}
                    control={control}
                    label={field.label}
                    options={field.options}
                    errors={errors}
                  />
                );
              }

              return (
                <FormTextField
                  key={field.name}
                  name={field.name}
                  control={control}
                  label={field.label}
                  type={field.type as 'text' | 'number' | 'date' | 'datetime-local' | undefined}
                  errors={errors}
                />
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
