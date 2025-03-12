import { ContentSchedule } from '@/types/dashboard';
import { Paper, Box, Typography, Divider, Chip, Grid, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Calendar as CalendarIcon, PlayCircle as PlayIcon, ChevronDown as ChevronDownIcon, Check as CheckIcon } from 'lucide-react';

interface ContentSchedulesProps {
  schedules: ContentSchedule[];
}

export function ContentSchedules({ schedules }: ContentSchedulesProps) {
  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'VERSE_HADITH':
        return '#1976d2'; // blue
      case 'ANNOUNCEMENT':
        return '#ff9800'; // orange
      case 'EVENT':
        return '#4caf50'; // green
      case 'CUSTOM':
        return '#9c27b0'; // purple
      default:
        return '#9e9e9e'; // grey
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 0,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: '1px solid',
        borderColor: 'rgba(0,0,0,0.05)',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarIcon size={20} />
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            Active Content Schedules
          </Typography>
        </Box>
        <Chip
          label={`${schedules.length} Schedule${schedules.length !== 1 ? 's' : ''}`}
          variant="outlined"
          size="small"
        />
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {schedules.map((schedule, index) => (
            <Grid item xs={12} key={schedule.id}>
              <Accordion
                disableGutters
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'rgba(0,0,0,0.05)',
                  '&:before': {
                    display: 'none',
                  },
                  borderRadius: 1,
                  mb: 0,
                  overflow: 'hidden',
                }}
              >
                <AccordionSummary
                  expandIcon={<ChevronDownIcon size={18} />}
                  sx={{
                    bgcolor: 'background.paper',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.01)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PlayIcon size={18} color={schedule.isActive ? '#4caf50' : '#9e9e9e'} />
                      <Typography variant="body1" fontWeight={500} sx={{ ml: 1 }}>
                        {schedule.name}
                      </Typography>
                      {schedule.isDefault && (
                        <Chip
                          label="Default"
                          size="small"
                          color="secondary"
                          sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                        />
                      )}
                    </Box>
                    <Chip
                      label={schedule.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        bgcolor: schedule.isActive ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                        color: schedule.isActive ? '#4caf50' : 'text.secondary',
                        borderColor: schedule.isActive ? 'transparent' : 'rgba(0,0,0,0.1)',
                        fontSize: '0.75rem',
                      }}
                      variant={schedule.isActive ? 'filled' : 'outlined'}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ bgcolor: 'rgba(0,0,0,0.01)', px: 2, py: 1.5 }}>
                  {schedule.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {schedule.description}
                    </Typography>
                  )}
                  
                  <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                    Content Items
                  </Typography>
                  
                  <Box sx={{ mt: 1 }}>
                    {schedule.items.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          p: 1.5,
                          mb: 1,
                          borderRadius: 1,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'rgba(0,0,0,0.05)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight={500}>
                            {item.contentItem.title}
                          </Typography>
                          <Chip
                            label={item.contentItem.type}
                            size="small"
                            sx={{
                              ml: 1,
                              height: 20,
                              fontSize: '0.65rem',
                              bgcolor: `${getContentTypeColor(item.contentItem.type)}20`,
                              color: getContentTypeColor(item.contentItem.type),
                            }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {item.contentItem.duration}s
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}

          {schedules.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No active schedules found. Create a schedule to get started.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </Paper>
  );
} 