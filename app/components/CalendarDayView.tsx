import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { Class } from '@/app/api/modules/class/dtos/Class';

interface CalendarDayViewProps {
  classes: Class[];
  onClassClick: (id: number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

const DEFAULT_START_HOUR = 6;
const END_HOUR = 23;
const HOUR_HEIGHT = 80; // pixels per hour

export default function CalendarDayView({ classes, onClassClick, onLoadMore, hasMore, loading }: CalendarDayViewProps) {
  const earliestClassHour = classes.length > 0 
    ? Math.min(...classes.map(c => new Date(c.date).getHours())) 
    : DEFAULT_START_HOUR;
  const startHour = Math.min(DEFAULT_START_HOUR, earliestClassHour);

  const hours = Array.from({ length: END_HOUR - startHour + 1 }, (_, i) => startHour + i);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100) { // Load when near bottom
      if (hasMore && !loading && onLoadMore) {
        onLoadMore();
      }
    }
  };

  // Process classes to handle overlaps
  const processedClasses = React.useMemo(() => {
    // 1. Map to events with start/end in minutes
    const events = classes.map(c => {
      const d = new Date(c.date);
      const start = (d.getHours() - startHour) * 60 + d.getMinutes();
      const end = start + 60; // Assume 60 mins duration
      return {
        ...c,
        start,
        end,
        top: (start / 60) * HOUR_HEIGHT,
        height: (60 / 60) * HOUR_HEIGHT - 4, // -4 for margin
      };
    }).sort((a, b) => a.start - b.start);

    type EventType = typeof events[0];

    // 2. Group into clusters
    const clusters: EventType[][] = [];
    let currentCluster: EventType[] = [];
    let clusterEnd = -1;

    events.forEach(event => {
      if (currentCluster.length === 0) {
        currentCluster.push(event);
        clusterEnd = event.end;
      } else {
        if (event.start < clusterEnd) {
          currentCluster.push(event);
          clusterEnd = Math.max(clusterEnd, event.end);
        } else {
          clusters.push(currentCluster);
          currentCluster = [event];
          clusterEnd = event.end;
        }
      }
    });
    if (currentCluster.length > 0) clusters.push(currentCluster);

    // 3. Process each cluster to assign columns
    const result: (EventType & { style: React.CSSProperties })[] = [];

    clusters.forEach(cluster => {
      const columns: number[] = []; // stores end time of last event in each column
      
      const clusterEventsWithCol = cluster.map(event => {
        let colIndex = -1;
        for (let i = 0; i < columns.length; i++) {
          if (columns[i] <= event.start) {
            colIndex = i;
            columns[i] = event.end;
            break;
          }
        }
        if (colIndex === -1) {
          colIndex = columns.length;
          columns.push(event.end);
        }
        return { ...event, colIndex };
      });

      const maxCols = columns.length;
      
      clusterEventsWithCol.forEach(event => {
        result.push({
          ...event,
          style: {
            position: 'absolute',
            top: event.top,
            height: event.height,
            left: `calc(60px + ((100% - 70px) * ${event.colIndex} / ${maxCols}))`,
            width: `calc((100% - 70px) / ${maxCols})`,
            zIndex: 1,
          }
        });
      });
    });

    return result;
  }, [classes, startHour]);

  return (
    <Paper 
      onScroll={handleScroll}
      sx={{ 
        position: 'relative', 
        height: 'calc(100vh - 250px)', // Fixed height for scrolling
        overflowY: 'auto', 
        border: '1px solid #e0e0e0', 
        mt: 2 
      }}
    >
      {hours.map((hour) => (
        <Box
          key={hour}
          sx={{
            position: 'absolute',
            top: (hour - startHour) * HOUR_HEIGHT,
            left: 0,
            right: 0,
            height: HOUR_HEIGHT,
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'start',
            pl: 1,
            boxSizing: 'border-box'
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ width: 50, pt: 1 }}>
            {`${hour.toString().padStart(2, '0')}:00`}
          </Typography>
          <Box sx={{ borderLeft: '1px solid #f0f0f0', height: '100%', flex: 1 }} />
        </Box>
      ))}

      {processedClasses.map((c) => {
        if (c.top < 0) return null; // Skip classes before start time (shouldn't happen with dynamic startHour)

        return (
          <Box
            key={c.id}
            onClick={() => onClassClick(c.id)}
            sx={{
              ...c.style,
              backgroundColor: c.status === 'open' ? 'primary.light' : 'grey.300',
              color: c.status === 'open' ? 'primary.contrastText' : 'text.primary',
              borderRadius: 1,
              p: 1,
              cursor: 'pointer',
              overflow: 'hidden',
              fontSize: '0.875rem',
              boxShadow: 1,
              '&:hover': {
                opacity: 0.9,
                zIndex: 2,
                boxShadow: 3,
              },
            }}
          >
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 'bold' }}>
              {c.description} ({c.kind})
            </Typography>
            <Typography variant="caption" display="block" noWrap>
               {new Date(c.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {c.users?.length || 0}/{c.numberOfParticipants}
            </Typography>
          </Box>
        );
      })}
    </Paper>
  );
}
