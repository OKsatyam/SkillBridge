import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Grid, Card, CardContent, Chip, Avatar, Button, CircularProgress,
  TextField, Alert, List, ListItem, ListItemAvatar, ListItemText, Divider,
} from '@mui/material';
import { useGetJobByIdQuery } from '../features/jobs/jobsApi';
import {
  useSubmitProposalMutation, useGetProposalsForJobQuery, useUpdateProposalStatusMutation,
} from '../features/proposals/proposalsApi';
import { useCreateContractMutation } from '../features/contracts/contractsApi';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { data, isLoading, isError } = useGetJobByIdQuery(id);

  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [submitProposal, { isLoading: submitting, error: submitError }] = useSubmitProposalMutation();
  const [updateStatus] = useUpdateProposalStatusMutation();
  const [createContract, { isLoading: hiring }] = useCreateContractMutation();

  const job = data?.data?.job;
  const isOwner = Boolean(user && job && job.client?._id === user._id);

  const { data: proposalsData } = useGetProposalsForJobQuery(id, { skip: !isOwner });

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }
  if (isError || !job) {
    return <Typography color="error" sx={{ p: 4 }}>Job not found.</Typography>;
  }

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    try {
      await submitProposal({
        jobId: id,
        coverLetter,
        bidAmount: Number(bidAmount),
        durationDays: Number(durationDays),
      }).unwrap();
      setCoverLetter('');
      setBidAmount('');
      setDurationDays('');
    } catch {
      // handled by submitError below
    }
  };

  const handleAccept = async (proposalId) => {
    try {
      await updateStatus({ id: proposalId, status: 'accepted' }).unwrap();
      const res = await createContract({ source: 'job', proposalId }).unwrap();
      navigate(`/contracts/${res.data.contract._id}`);
    } catch {
      // errors surface via refetched proposal/job state
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" fontWeight={700} gutterBottom>{job.title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar>{job.client?.name?.[0]?.toUpperCase()}</Avatar>
            <Typography>{job.client?.name}</Typography>
          </Box>
          {job.category?.name && <Chip label={job.category.name} sx={{ mb: 2 }} />}
          <Typography variant="h6" fontWeight={600} gutterBottom>Description</Typography>
          <Typography color="text.secondary" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>{job.description}</Typography>
          {job.skills?.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              {job.skills.map((s) => <Chip key={s} label={s} size="small" variant="outlined" />)}
            </Box>
          )}

          {isOwner && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Proposals ({proposalsData?.data?.proposals?.length || 0})
              </Typography>
              <List>
                {proposalsData?.data?.proposals?.map((p) => (
                  <ListItem
                    key={p._id}
                    divider
                    secondaryAction={
                      ['submitted', 'shortlisted'].includes(p.status) ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" onClick={() => updateStatus({ id: p._id, status: 'shortlisted' })}>Shortlist</Button>
                          <Button size="small" color="error" onClick={() => updateStatus({ id: p._id, status: 'rejected' })}>Reject</Button>
                          <Button size="small" variant="contained" disabled={hiring} onClick={() => handleAccept(p._id)}>Hire</Button>
                        </Box>
                      ) : (
                        <Chip label={p.status} size="small" />
                      )
                    }
                  >
                    <ListItemAvatar><Avatar>{p.freelancer?.name?.[0]?.toUpperCase()}</Avatar></ListItemAvatar>
                    <ListItemText
                      primary={`${p.freelancer?.name} — $${p.bidAmount} / ${p.durationDays} days`}
                      secondary={p.coverLetter}
                    />
                  </ListItem>
                ))}
                {proposalsData?.data?.proposals?.length === 0 && (
                  <Typography color="text.secondary">No proposals yet.</Typography>
                )}
              </List>
            </>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h5" fontWeight={700}>
                {job.budgetType === 'fixed' ? `$${job.budget}` : `$${job.budget}/hr`}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                {job.budgetType === 'fixed' ? 'Fixed price' : 'Hourly rate'}
              </Typography>
              {job.deadline && (
                <Typography variant="body2" color="text.secondary">
                  Deadline: {new Date(job.deadline).toLocaleDateString()}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Status: {job.status}
              </Typography>

              {!isOwner && user?.roles?.includes('freelancer') && ['open', 'in-review'].includes(job.status) && (
                <Box component="form" onSubmit={handleSubmitProposal} sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Submit a Proposal</Typography>
                  {submitError && (
                    <Alert severity="error" sx={{ mb: 1 }}>{submitError.data?.message || 'Failed to submit'}</Alert>
                  )}
                  <TextField label="Cover Letter" fullWidth multiline rows={3} margin="dense"
                    value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} required />
                  <TextField label="Bid Amount ($)" type="number" fullWidth margin="dense"
                    value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} required />
                  <TextField label="Duration (days)" type="number" fullWidth margin="dense"
                    value={durationDays} onChange={(e) => setDurationDays(e.target.value)} required />
                  <Button type="submit" variant="contained" fullWidth sx={{ mt: 1 }} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Proposal'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
