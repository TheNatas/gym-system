'use client';

import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ListItemButton from '@mui/material/ListItemButton';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Skeleton from '@mui/material/Skeleton';

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
  loading?: boolean;
  fullLoading?: boolean;
  silentLoading?: boolean;
}

export default function ListComponent(
  { title, items, onItemClick, total, page, pageSize = 10, onPageChange, loading, fullLoading, silentLoading }: ListComponentProps
) {
  const currentPage = page || 1;
  const showPagination = total !== undefined && total > pageSize;
  const totalPages = total ? Math.ceil(total / pageSize) : 1;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const visibleItems = items.slice(startIndex, endIndex);

  const showSkeleton = fullLoading || (loading && visibleItems.length === 0);
  const showSpinner = silentLoading || (loading && visibleItems.length > 0);

  if (showSkeleton) {
    return (
      <Paper elevation={2} sx={{ maxWidth: 600, margin: 'auto', p: 2 }}>
        {title && (
          <Typography variant="h6" component="div" sx={{ mb: 2 }}>
            {title}
          </Typography>
        )}
        <List>
          {Array.from(new Array(5)).map((_, index) => (
            <ListItem key={index} disablePadding divider>
              <ListItemButton>
                <ListItemText
                  primary={<Skeleton animation="wave" height={24} width="60%" />}
                  secondary={<Skeleton animation="wave" height={20} width="40%" />}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ maxWidth: 600, margin: 'auto', p: 2, position: 'relative' }}>
      {showSpinner && (
        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
          <CircularProgress size={20} />
        </Box>
      )}
      {title && (
        <Typography variant="h6" component="div" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <List>
        {visibleItems.map((item) => (
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
              value={currentPage}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 1 && val <= totalPages) {
                  onPageChange?.(val);
                }
              }}
              slotProps={{ htmlInput: { min: 1, max: totalPages } }}
              fullWidth
            />
          </Box>
        </Box>
      )}
    </Paper>
  );
}
