import { Card, CardMedia, CardContent, Typography, Chip, Box, Avatar, Stack } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { Link as RouterLink } from 'react-router-dom';

export default function GigCard({ gig }) {
  const startingPrice = gig.packages?.length ? Math.min(...gig.packages.map((p) => p.price)) : null;
  const imageUrl = gig.images?.[0]
    ? `${import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')}${gig.images[0]}`
    : null;

  return (
    <Card
      component={RouterLink}
      to={`/gigs/${gig._id}`}
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
      <Box
        sx={{
          height: 150,
          bgcolor: imageUrl ? 'transparent' : 'rgba(67,56,202,0.06)',
          display: imageUrl ? 'block' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {imageUrl ? (
          <CardMedia component="img" height="150" image={imageUrl} alt={gig.title} sx={{ objectFit: 'cover' }} />
        ) : (
          <Typography variant="h5" fontWeight={800} color="primary.light">
            {gig.title?.[0]?.toUpperCase()}
          </Typography>
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Avatar sx={{ width: 22, height: 22, fontSize: 12, bgcolor: 'secondary.main' }}>
            {gig.owner?.name?.[0]?.toUpperCase()}
          </Avatar>
          <Typography variant="body2" color="text.secondary" noWrap>{gig.owner?.name}</Typography>
        </Stack>

        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 48,
          }}
        >
          {gig.title}
        </Typography>

        {gig.category?.name && (
          <Chip size="small" label={gig.category.name} sx={{ alignSelf: 'flex-start', mb: 1.5 }} />
        )}

        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {gig.rating?.count > 0 ? (
            <Stack direction="row" alignItems="center" spacing={0.3}>
              <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
              <Typography variant="body2" fontWeight={600}>{gig.rating.avg.toFixed(1)}</Typography>
              <Typography variant="body2" color="text.secondary">({gig.rating.count})</Typography>
            </Stack>
          ) : <Box />}
          {startingPrice !== null && (
            <Typography variant="body2" color="text.secondary">
              From <Typography component="span" fontWeight={700} color="text.primary">${startingPrice}</Typography>
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
