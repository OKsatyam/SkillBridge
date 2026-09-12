import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box, Typography, TextField, MenuItem, Button, Grid, Paper, Alert, Divider,
} from '@mui/material';
import { useCreateGigMutation } from '../features/gigs/gigsApi';
import { useGetCategoriesQuery } from '../features/categories/categoriesApi';

const emptyPackage = { price: '', deliveryDays: '', revisions: '', features: '' };

export default function CreateGigPage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { data: categoriesData } = useGetCategoriesQuery();
  const [createGig, { isLoading, error }] = useCreateGigMutation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('active');
  const [images, setImages] = useState([]);
  const [packages, setPackages] = useState({
    basic: { ...emptyPackage },
    standard: { ...emptyPackage },
    premium: { ...emptyPackage },
  });

  if (!user?.roles?.includes('freelancer')) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          Only freelancers can create gigs. Switch roles from your profile settings first.
        </Alert>
      </Box>
    );
  }

  const handlePackageChange = (tier, field, value) => {
    setPackages((prev) => ({ ...prev, [tier]: { ...prev[tier], [field]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const packagesArray = ['basic', 'standard', 'premium']
      .filter((tier) => packages[tier].price)
      .map((tier) => ({
        tier,
        price: Number(packages[tier].price),
        deliveryDays: Number(packages[tier].deliveryDays),
        revisions: Number(packages[tier].revisions),
        features: packages[tier].features.split(',').map((f) => f.trim()).filter(Boolean),
      }));

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('status', status);
    formData.append('tags', JSON.stringify(tags.split(',').map((t) => t.trim()).filter(Boolean)));
    formData.append('packages', JSON.stringify(packagesArray));
    images.forEach((file) => formData.append('images', file));

    try {
      const res = await createGig(formData).unwrap();
      navigate(`/gigs/${res.data.gig._id}`);
    } catch {
      // handled by `error` below
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} mb={3}>Create a Gig</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error.data?.message || 'Failed to create gig'}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField label="Title" fullWidth margin="normal" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <TextField label="Description" fullWidth multiline rows={4} margin="normal" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <TextField select label="Category" fullWidth margin="normal" value={category} onChange={(e) => setCategory(e.target.value)} required>
            {categoriesData?.data?.categories?.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
            ))}
          </TextField>
          <TextField label="Tags (comma separated)" fullWidth margin="normal" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="react, node, mongodb" />
          <TextField select label="Status" fullWidth margin="normal" value={status} onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="active">Active</MenuItem>
          </TextField>

          <Button variant="outlined" component="label" sx={{ mt: 2 }}>
            Upload Images
            <input type="file" hidden multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))} />
          </Button>
          {images.length > 0 && <Typography variant="body2" sx={{ mt: 1 }}>{images.length} file(s) selected</Typography>}

          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>Packages</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Fill in at least one tier (leave price blank on tiers you don't want to offer).
          </Typography>

          {['basic', 'standard', 'premium'].map((tier) => (
            <Box key={tier} sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', mb: 1 }} fontWeight={600}>{tier}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField label="Price ($)" type="number" fullWidth value={packages[tier].price}
                    onChange={(e) => handlePackageChange(tier, 'price', e.target.value)} />
                </Grid>
                <Grid item xs={4}>
                  <TextField label="Delivery Days" type="number" fullWidth value={packages[tier].deliveryDays}
                    onChange={(e) => handlePackageChange(tier, 'deliveryDays', e.target.value)} />
                </Grid>
                <Grid item xs={4}>
                  <TextField label="Revisions" type="number" fullWidth value={packages[tier].revisions}
                    onChange={(e) => handlePackageChange(tier, 'revisions', e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Features (comma separated)" fullWidth value={packages[tier].features}
                    onChange={(e) => handlePackageChange(tier, 'features', e.target.value)} />
                </Grid>
              </Grid>
            </Box>
          ))}

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={isLoading}>
            {isLoading ? 'Publishing...' : 'Publish Gig'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
