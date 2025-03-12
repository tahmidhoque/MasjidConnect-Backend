import { Box, Grid, Paper, Typography, LinearProgress } from '@mui/material';

interface Metric {
  label: string;
  value: number;
  total?: number;
  color: string;
}

interface DashboardMetricsProps {
  metrics: Metric[];
}

export default function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {metrics.map((metric, index) => (
        <Grid item xs={12} sm={4} key={index}>
          <Paper 
            elevation={0} 
            sx={{
              p: 2.5,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              height: '100%',
              border: '1px solid',
              borderColor: 'rgba(0,0,0,0.05)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {metric.label}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, color: metric.color }}>
              {metric.value}
              {metric.total !== undefined && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {metric.total > 0 ? `of ${metric.total}` : ''}
                </Typography>
              )}
            </Typography>
            
            {metric.total !== undefined && metric.total > 0 && (
              <Box sx={{ width: '100%' }}>
                <LinearProgress
                  variant="determinate"
                  value={metric.total > 0 ? (metric.value / metric.total) * 100 : 0}
                  sx={{
                    height: 6,
                    borderRadius: 1,
                    bgcolor: 'rgba(0,0,0,0.05)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: metric.color,
                    }
                  }}
                />
              </Box>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
} 