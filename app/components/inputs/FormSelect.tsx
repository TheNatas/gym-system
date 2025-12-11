import React from 'react';
import { Controller, Control, FieldValues, Path, FieldErrors } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

type FormSelectProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options?: { value: string | number; label: string }[];
  errors: FieldErrors<T>;
}

export function FormSelect<T extends FieldValues>({ name, control, label, options = [], errors }: FormSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ref } }) => (
        <TextField
          select
          inputRef={ref}
          label={label}
          value={value ?? ''}
          onChange={onChange}
          error={!!errors[name]}
          helperText={errors[name]?.message as string}
          fullWidth
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
