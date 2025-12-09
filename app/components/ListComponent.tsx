'use client';

import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import ListItemButton from '@mui/material/ListItemButton';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

type SimpleListItem = {
  id: string | number;
  primary: string;
  secondary?: string;
}

type ListComponentProps = {
  title?: string;
  items: SimpleListItem[];
  onItemClick?: (id: string | number) => void;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (newPage: number) => void;
}

export default function ListComponent({ title, items, onItemClick, total, page, pageSize = 10, onPageChange }: ListComponentProps) {
  const showPagination = total !== undefined && items.length !== total;
  const totalPages = total ? Math.ceil(total / pageSize) : 1;

  return (
    <Paper elevation={2} sx={{ maxWidth: 600, margin: 'auto', p: 2 }}>
      {title && (
        <Typography variant="h6" component="div" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <List>
        {items.map((item) => (
          <ListItem key={item.id} disablePadding divider>
             <ListItemButton onClick={() => onItemClick && onItemClick(item.id)}>
              <ListItemText
                primary={item.primary}
                secondary={item.secondary}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {showPagination && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: 100 }}>
            <TextField
              label="Page"
              type="number"
              value={page || 1}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 1 && val <= totalPages) {
                  onPageChange?.(val);
                }
              }}
              inputProps={{ min: 1, max: totalPages }}
              fullWidth
            />
          </Box>
        </Box>
      )}
    </Paper>
  );
}
