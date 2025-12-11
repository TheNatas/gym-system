import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';
import { Class } from '@/app/api/modules/class/dtos/Class';

type CalendarDayViewProps = {
  classes: Class[];
  onClassClick: (id: number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
};

const ClassKindMap = {
  'Cross': 'Cross',
  'Functional': 'Funcional',
  'Pilates': 'Pilates',
};

const ClassStatusMap : Record<Class['status'], string> = {
  'open': 'Aberto',
  'completed': 'Concluído',
};

const DEFAULT_START_HOUR = 6;
const END_HOUR = 23;
const HOUR_HEIGHT_PIXELS = 80;

export default function CalendarDayView({ classes, onClassClick, onLoadMore, hasMore, loading }: CalendarDayViewProps) {
  const earliestClassHour = classes.length > 0 
    ? Math.min(...classes.map(c => new Date(c.date).getHours())) 
    : DEFAULT_START_HOUR;
  const startHour = Math.min(DEFAULT_START_HOUR, earliestClassHour);

  const hours = Array.from({ length: END_HOUR - startHour + 1 }, (_, i) => startHour + i);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      if (hasMore && !loading && onLoadMore) {
        onLoadMore();
      }
    }
  };

  const processedClasses = React.useMemo(() => {
    const events = classes.map(c => {
      const d = new Date(c.date);
      const start = (d.getHours() - startHour) * 60 + d.getMinutes();
      const end = start + 60; // always 60 mins duration
      return {
        ...c,
        start,
        end,
        top: (start / 60) * HOUR_HEIGHT_PIXELS,
        height: (60 / 60) * HOUR_HEIGHT_PIXELS - 4,
      };
    }).sort((a, b) => a.start - b.start);

    type EventType = typeof events[0];

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

    const result: (EventType & { style: React.CSSProperties })[] = [];

    clusters.forEach(cluster => {
      const columns: number[] = [];
      
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

  if (loading && classes.length === 0) {
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
      {loading && classes.length > 0 && (
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

      {processedClasses.map((c) => {
        if (c.top < 0) return null;

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
              {c.description} ({ClassKindMap[c.kind]})
            </Typography>
            <Typography variant="caption" display="block" noWrap>
               {new Date(c.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {c.users?.length || 0}/{c.numberOfParticipants} {ClassStatusMap[c.status]}
            </Typography>
          </Box>
        );
      })}
    </Paper>
  );
}
