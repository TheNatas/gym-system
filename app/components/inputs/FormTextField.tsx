import React from 'react';
import { Controller, Control, FieldValues, Path, FieldErrors } from 'react-hook-form';
import TextField from '@mui/material/TextField';

type FormTextFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
  type?: 'text' | 'number' | 'date' | 'datetime-local';
  errors: FieldErrors<T>;
}

export function FormTextField<T extends FieldValues>({ name, control, label, type = 'text', errors }: FormTextFieldProps<T>) {
  const toLocalISOString = (date: Date, dateOnly: boolean) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    if (dateOnly) return `${year}-${month}-${day}`;
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ref } }) => (
        <TextField
          inputRef={ref}
          label={label}
          type={type}
          value={
            (type === 'date' || type === 'datetime-local') && (value as unknown) instanceof Date
              ? toLocalISOString(value as Date, type === 'date')
              : value ?? ''
          }
          onChange={(e) => {
            let val: string | number | Date = e.target.value;
            if (type === 'number') {
              val = Number(val);
            } else if (type === 'date') {
               if (val) {
                 const [y, m, d] = val.split('-').map(Number);
                 val = new Date(y, m - 1, d);
               }
            } else if (type === 'datetime-local') {
               if (val) {
                 val = new Date(val);
               }
            }
            onChange(val);
          }}
          error={!!errors[name]}
          helperText={errors[name]?.message as string}
          fullWidth
          slotProps={{ inputLabel: 
            type === 'date' || type === 'datetime-local'
              ? { shrink: true }
              : undefined
          }}
        />
      )}
    />
  );
}
