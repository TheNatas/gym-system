import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';

type Event = {
  id: number;
  name: string;
  start: Date;
  end: Date;
  description: string;
  status: 'open' | 'completed';
}

type CalendarDayViewProps = {
  events: Event[];
  onClassClick: (id: number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
};

const DEFAULT_START_HOUR = 6;
const END_HOUR = 23;
const HOUR_HEIGHT_PIXELS = 80;

export default function CalendarDayView(
  { events, onClassClick, onLoadMore, hasMore, loading }: CalendarDayViewProps
) {
  const earliestEventHour = events.length > 0 
    ? Math.min(...events.map(c => new Date(c.start).getHours())) 
    : DEFAULT_START_HOUR;
  const startHour = Math.min(DEFAULT_START_HOUR, earliestEventHour);

  const hours = Array.from(
    { length: END_HOUR - startHour + 1 }, 
    (_, i) => startHour + i
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      if (hasMore && !loading && onLoadMore) {
        onLoadMore();
      }
    }
  };

  const processedEvents = useMemo(() => {
    const formattedEvents = events.map(event => {
      console.log(event);
      const startMinutes = (new Date(event.start).getHours() - startHour) * 60 + new Date(event.start).getMinutes();
      const endMinutes = (new Date(event.end).getHours() - startHour) * 60 + new Date(event.end).getMinutes();
      return {
        ...event,
        startMinutes: startMinutes,
        endMinutes: endMinutes,
        top: (startMinutes / 60) * HOUR_HEIGHT_PIXELS,
        height: (60 / 60) * HOUR_HEIGHT_PIXELS - 4,
      };
    }).sort((a, b) => a.startMinutes - b.startMinutes);

    type EventType = typeof formattedEvents[0];

    const clusters: EventType[][] = [];
    let currentCluster: EventType[] = [];
    let clusterEnd = -1;

    formattedEvents.forEach(event => {
      if (currentCluster.length === 0) {
        currentCluster.push(event);
        clusterEnd = event.endMinutes;
      } else {
        if (event.startMinutes < clusterEnd) {
          currentCluster.push(event);
          clusterEnd = Math.max(clusterEnd, event.endMinutes);
        } else {
          clusters.push(currentCluster);
          currentCluster = [event];
          clusterEnd = event.endMinutes;
        }
      }
    });
    if (currentCluster.length > 0) clusters.push(currentCluster);

    const result: (EventType & { style: React.CSSProperties })[] = [];

    clusters.forEach(cluster => {
      const columns: number[] = [];
      
      const clusterEventsWithCol = cluster.map(event => {
        let colIndex = -1;
        for (let i = 0; i < columns.length; i++) {
          if (columns[i] <= event.startMinutes) {
            colIndex = i;
            columns[i] = event.endMinutes;
            break;
          }
        }
        if (colIndex === -1) {
          colIndex = columns.length;
          columns.push(event.endMinutes);
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
  }, [events, startHour]);

  if (loading && events.length === 0) {
    return (
      <Paper 
        sx={{ 
          position: 'relative', 
          height: 'calc(100vh - 250px)',
          overflowY: 'hidden', 
          border: '1px solid #e0e0e0', 
          mt: 2 
        }}
      >
        {hours.map((hour) => (
          <Box
            key={hour}
            sx={{
              position: 'absolute',
              top: (hour - startHour) * HOUR_HEIGHT_PIXELS,
              left: 0,
              right: 0,
              height: HOUR_HEIGHT_PIXELS,
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
        
        {[0, 2, 4].map((offset) => (
             <Box
                key={offset}
                sx={{
                    position: 'absolute',
                    top: (offset + 1) * HOUR_HEIGHT_PIXELS + 10,
                    left: 70,
                    right: 20,
                    height: HOUR_HEIGHT_PIXELS - 20,
                    borderRadius: 1,
                    zIndex: 1,
                }}
             >
                <Skeleton variant="rectangular" height="100%" animation="wave" sx={{ borderRadius: 1 }} />
             </Box>
        ))}
      </Paper>
    );
  }

  return (
    <Paper 
      onScroll={handleScroll}
      sx={{ 
        position: 'relative', 
        height: 'calc(100vh - 250px)',
        overflowY: 'auto', 
        border: '1px solid #e0e0e0', 
        mt: 2 
      }}
    >
      {loading && events.length > 0 && (
        <Box sx={{ position: 'sticky', top: 10, zIndex: 100, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
           <Paper elevation={3} sx={{ borderRadius: '50%', p: 0.5, display: 'flex', bgcolor: 'background.paper' }}>
             <CircularProgress size={20} />
           </Paper>
        </Box>
      )}

      {hours.map((hour) => (
        <Box
          key={hour}
          sx={{
            position: 'absolute',
            top: (hour - startHour) * HOUR_HEIGHT_PIXELS,
            left: 0,
            right: 0,
            height: HOUR_HEIGHT_PIXELS,
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

      {processedEvents.map((event) => {
        console.log('event processed', event);
        if (event.top < 0) return null;

        return (
          <Box
            key={event.id}
            onClick={() => onClassClick(event.id)}
            sx={{
              ...event.style,
              backgroundColor: event.status === 'open' ? 'primary.light' : 'grey.300',
              color: event.status === 'open' ? 'primary.contrastText' : 'text.primary',
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
              {event.name}
            </Typography>
            <Typography variant="caption" display="block" noWrap>
               {new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {event.description}
            </Typography>
          </Box>
        );
      })}
    </Paper>
  );
}
