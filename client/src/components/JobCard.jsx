import { Card, CardContent, Typography, Chip, Box, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function JobCard({ job }) {
  return (
    <Card
      component={RouterLink}
      to={`/jobs/${job._id}`}
      sx={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        '&:hover': {
          boxShadow: '0 8px 20px rgba(16,24,40,0.10)',
          borderColor: 'primary.light',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {job.title}
          </Typography>
          <Chip
            size="small"
            label={job.budgetType === 'fixed' ? `$${job.budget}` : `$${job.budget}/hr`}
            color="secondary"
            sx={{ flexShrink: 0 }}
          />
        </Stack>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Posted by {job.client?.name}
        </Typography>

        {job.category?.name && (
          <Chip size="small" variant="outlined" label={job.category.name} sx={{ alignSelf: 'flex-start', mb: 1.5 }} />
        )}

        {job.skills?.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 'auto', pt: 1 }}>
            {job.skills.slice(0, 4).map((s) => (
              <Chip key={s} label={s} size="small" variant="outlined" sx={{ borderColor: 'divider' }} />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
