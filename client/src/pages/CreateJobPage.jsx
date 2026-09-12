import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Typography, TextField, MenuItem, Button, Paper, Alert } from '@mui/material';
import { useCreateJobMutation } from '../features/jobs/jobsApi';
import { useGetCategoriesQuery } from '../features/categories/categoriesApi';

export default function CreateJobPage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { data: categoriesData } = useGetCategoriesQuery();
  const [createJob, { isLoading, error }] = useCreateJobMutation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [skills, setSkills] = useState('');
  const [budgetType, setBudgetType] = useState('fixed');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');

  if (!user?.roles?.includes('client')) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">Only clients can post jobs.</Alert>
      </Box>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createJob({
        title,
        description,
        category,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        budgetType,
        budget: Number(budget),
        deadline: deadline || undefined,
      }).unwrap();
      navigate(`/jobs/${res.data.job._id}`);
    } catch {
      // handled by `error` below
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} mb={3}>Post a Job</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error.data?.message || 'Failed to post job'}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField label="Title" fullWidth margin="normal" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <TextField label="Description" fullWidth multiline rows={4} margin="normal" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <TextField select label="Category" fullWidth margin="normal" value={category} onChange={(e) => setCategory(e.target.value)} required>
            {categoriesData?.data?.categories?.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
            ))}
          </TextField>
          <TextField label="Required Skills (comma separated)" fullWidth margin="normal" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="react, node, mongodb" />
          <TextField select label="Budget Type" fullWidth margin="normal" value={budgetType} onChange={(e) => setBudgetType(e.target.value)}>
            <MenuItem value="fixed">Fixed Price</MenuItem>
            <MenuItem value="hourly">Hourly</MenuItem>
          </TextField>
          <TextField label={budgetType === 'fixed' ? 'Budget ($)' : 'Hourly Rate ($)'} type="number" fullWidth margin="normal" value={budget} onChange={(e) => setBudget(e.target.value)} required />
          <TextField label="Deadline" type="date" fullWidth margin="normal" InputLabelProps={{ shrink: true }} value={deadline} onChange={(e) => setDeadline(e.target.value)} />

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={isLoading}>
            {isLoading ? 'Posting...' : 'Post Job'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
