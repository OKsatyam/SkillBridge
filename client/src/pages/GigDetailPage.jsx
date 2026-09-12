import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Chip, Avatar, Button, CircularProgress, Tabs, Tab, Alert } from '@mui/material';
import { useGetGigByIdQuery } from '../features/gigs/gigsApi';
import { useCreateContractMutation } from '../features/contracts/contractsApi';

const buildImageUrl = (path) => `${import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')}${path}`;

export default function GigDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { data, isLoading, isError } = useGetGigByIdQuery(id);
  const [selectedTier, setSelectedTier] = useState(0);
  const [createContract, { isLoading: buying, error: buyError }] = useCreateContractMutation();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data?.data?.gig) {
    return <Typography color="error" sx={{ p: 4 }}>Gig not found.</Typography>;
  }

  const gig = data.data.gig;
  const packages = gig.packages || [];
  const selectedPackage = packages[selectedTier];
  const isOwnGig = user && gig.owner?._id === user._id;

  const handleBuy = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await createContract({ source: 'gig', gigId: gig._id, tier: selectedPackage.tier }).unwrap();
      navigate(`/contracts/${res.data.contract._id}`);
    } catch {
      // handled by buyError below
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" fontWeight={700} gutterBottom>{gig.title}</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar>{gig.owner?.name?.[0]?.toUpperCase()}</Avatar>
            <Typography>{gig.owner?.name}</Typography>
            {gig.rating?.count > 0 && (
              <Typography color="text.secondary">⭐ {gig.rating.avg.toFixed(1)} ({gig.rating.count} reviews)</Typography>
            )}
          </Box>

          {gig.category?.name && <Chip label={gig.category.name} sx={{ mb: 2 }} />}

          {gig.images?.length > 0 && (
            <CardMedia
              component="img"
              image={buildImageUrl(gig.images[0])}
              alt={gig.title}
              sx={{ borderRadius: 2, mb: 3, maxHeight: 400, objectFit: 'cover' }}
            />
          )}

          <Typography variant="h6" fontWeight={600} gutterBottom>About this gig</Typography>
          <Typography color="text.secondary" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>{gig.description}</Typography>

          {gig.tags?.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {gig.tags.map((tag) => <Chip key={tag} label={tag} size="small" variant="outlined" />)}
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <Tabs value={selectedTier} onChange={(e, val) => setSelectedTier(val)} variant="fullWidth">
              {packages.map((pkg, i) => (
                <Tab key={pkg.tier} label={pkg.tier} value={i} />
              ))}
            </Tabs>
            {selectedPackage && (
              <CardContent>
                <Typography variant="h5" fontWeight={700}>${selectedPackage.price}</Typography>
                <Typography color="text.secondary" gutterBottom>
                  {selectedPackage.deliveryDays}-day delivery · {selectedPackage.revisions} revisions
                </Typography>
                {selectedPackage.features?.length > 0 && (
                  <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                    {selectedPackage.features.map((f) => (
                      <li key={f}><Typography variant="body2">{f}</Typography></li>
                    ))}
                  </Box>
                )}
                {buyError && (
                  <Alert severity="error" sx={{ mb: 2 }}>{buyError.data?.message || 'Failed to start order'}</Alert>
                )}
                {isOwnGig ? (
                  <Alert severity="info">This is your own gig.</Alert>
                ) : (
                  <Button variant="contained" fullWidth disabled={buying} onClick={handleBuy}>
                    {buying ? 'Starting order...' : 'Continue'}
                  </Button>
                )}
              </CardContent>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
