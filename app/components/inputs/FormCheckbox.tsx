import React from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

interface FormCheckboxProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
}

export function FormCheckbox<T extends FieldValues>({ name, control, label }: FormCheckboxProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ref } }) => (
        <FormControlLabel
          control={
            <Checkbox
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              inputRef={ref}
            />
          }
          label={label}
        />
      )}
    />
  );
}
