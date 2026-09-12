import { useState } from 'react';
import { Box, Grid, TextField, MenuItem, Pagination, Typography, CircularProgress } from '@mui/material';
import { useGetGigsQuery } from '../features/gigs/gigsApi';
import { useGetCategoriesQuery } from '../features/categories/categoriesApi';
import GigCard from '../components/GigCard';

export default function GigsListPage() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data, isLoading, isError } = useGetGigsQuery({
    keyword: keyword || undefined,
    category: category || undefined,
    page,
    limit: 8,
  });

  const gigs = data?.data?.gigs || [];
  const totalPages = data?.data?.totalPages || 1;

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4, maxWidth: 1280, mx: 'auto' }}>
      <Typography variant="h4" mb={3}>Browse Gigs</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField
          label="Search gigs"
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          sx={{ flexGrow: 1 }}
        />
        <TextField
          select
          label="Category"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          sx={{ width: 220 }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categoriesData?.data?.categories?.map((cat) => (
            <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
          ))}
        </TextField>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && <Typography color="error">Failed to load gigs.</Typography>}

      {!isLoading && !isError && gigs.length === 0 && (
        <Typography color="text.secondary">No gigs found.</Typography>
      )}

      <Grid container spacing={3}>
        {gigs.map((gig) => (
          <Grid item xs={12} sm={6} md={3} key={gig._id}>
            <GigCard gig={gig} />
          </Grid>
        ))}
      </Grid>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination count={totalPages} page={page} onChange={(e, value) => setPage(value)} color="primary" />
        </Box>
      )}
    </Box>
  );
}
