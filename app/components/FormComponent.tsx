'use client';

import React, { useEffect } from 'react';
import { useForm, FieldValues, DefaultValues, Path, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodType } from 'zod';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { FormCheckbox } from './inputs/FormCheckbox';
import { FormSelect } from './inputs/FormSelect';
import { FormTextField } from './inputs/FormTextField';

export type FormField<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  type?: 'text' | 'number' | 'date' | 'datetime-local' | 'select' | 'checkbox';
  options?: { value: string | number; label: string }[];
}

type FormComponentProps<T extends FieldValues> = {
  open: boolean;
  onClose: () => void;
  title: string;
  schema: ZodType<T>;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as unknown as Resolver<T>,
    defaultValues,
  });

  useEffect(() => {
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
