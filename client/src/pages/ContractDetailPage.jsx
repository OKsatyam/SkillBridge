import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Card, CardContent, Chip, CircularProgress, Stepper, Step, StepLabel, Button, Divider, Alert,
  Rating, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  useGetContractByIdQuery, useSubmitMilestoneMutation, useFundMilestoneMutation, useApproveMilestoneMutation,
} from '../features/contracts/contractsApi';
import { useGetConversationForContractQuery } from '../features/conversations/conversationsApi';
import { useCreateReviewMutation } from '../features/reviews/reviewsApi';
import { useRaiseDisputeMutation } from '../features/disputes/disputesApi';
import ChatBox from '../components/ChatBox';

const MILESTONE_STEPS = ['pending', 'funded', 'in-progress', 'submitted', 'approved'];

export default function ContractDetailPage() {
  const { id } = useParams();
  const user = useSelector((state) => state.auth.user);
  const { data, isLoading, isError } = useGetContractByIdQuery(id);
  const [submitMilestone, { isLoading: submitting }] = useSubmitMilestoneMutation();
  const [fundMilestone, { isLoading: funding, error: fundError }] = useFundMilestoneMutation();
  const [approveMilestone, { isLoading: approving, error: approveError }] = useApproveMilestoneMutation();
  const { data: conversationData } = useGetConversationForContractQuery(id, { skip: !id });
  const [createReview, { isLoading: reviewSubmitting, error: reviewError }] = useCreateReviewMutation();
  const [raiseDispute, { isLoading: disputing, error: disputeError }] = useRaiseDisputeMutation();
  const [reviewedThisSession, setReviewedThisSession] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [disputeTarget, setDisputeTarget] = useState(null); // milestone id currently being disputed
  const [disputeReason, setDisputeReason] = useState('');

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }
  if (isError || !data?.data?.contract) {
    return <Typography color="error" sx={{ p: 4 }}>Contract not found.</Typography>;
  }

  const contract = data.data.contract;
  const isFreelancer = user?._id === contract.freelancer._id;
  const isClient = user?._id === contract.client._id;
  const title = contract.gig?.title || contract.job?.title || 'Contract';

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>{title}</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Chip label={`Client: ${contract.client.name}`} />
        <Chip label={`Freelancer: ${contract.freelancer.name}`} />
        <Chip label={contract.status} color="primary" />
      </Box>

      {fundError && <Alert severity="error" sx={{ mb: 2 }}>{fundError.data?.message}</Alert>}
      {approveError && <Alert severity="error" sx={{ mb: 2 }}>{approveError.data?.message}</Alert>}

      <Typography variant="h6" gutterBottom>Milestones</Typography>
      {contract.milestones.map((m) => {
        const stepIndex = MILESTONE_STEPS.indexOf(m.status === 'revision' ? 'submitted' : m.status);
        return (
          <Card key={m._id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography fontWeight={600}>{m.title}</Typography>
                <Typography fontWeight={600}>${m.amount}</Typography>
              </Box>
              <Stepper activeStep={stepIndex} alternativeLabel sx={{ my: 2 }}>
                {MILESTONE_STEPS.map((s) => (
                  <Step key={s}><StepLabel>{s}</StepLabel></Step>
                ))}
              </Stepper>
              {m.dueDate && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Due: {new Date(m.dueDate).toLocaleDateString()}
                </Typography>
              )}

              {isClient && m.status === 'pending' && (
                <Button
                  variant="contained"
                  size="small"
                  disabled={funding}
                  onClick={() => fundMilestone({ contractId: contract._id, milestoneId: m._id })}
                >
                  {funding ? 'Funding...' : 'Fund Milestone (move to escrow)'}
                </Button>
              )}

              {isFreelancer && ['funded', 'revision'].includes(m.status) && (
                <Button
                  variant="contained"
                  size="small"
                  disabled={submitting}
                  onClick={() => submitMilestone({ contractId: contract._id, milestoneId: m._id })}
                >
                  {submitting ? 'Submitting...' : 'Submit Work'}
                </Button>
              )}

              {isClient && m.status === 'submitted' && (
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  disabled={approving}
                  onClick={() => approveMilestone({ contractId: contract._id, milestoneId: m._id })}
                >
                  {approving ? 'Releasing...' : 'Approve & Release Payment'}
                </Button>
              )}

              {m.status === 'approved' && (
                <Chip label="Paid out" color="success" size="small" />
              )}

              {(isClient || isFreelancer) && ['funded', 'submitted', 'revision'].includes(m.status) && (
                <Button
                  size="small"
                  color="warning"
                  sx={{ ml: 1 }}
                  onClick={() => { setDisputeTarget(m._id); setDisputeReason(''); }}
                >
                  Raise Dispute
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}

      <Divider sx={{ my: 3 }} />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Total: ${contract.totalAmount}</Typography>

      {contract.status === 'completed' && !reviewedThisSession && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>Leave a Review</Typography>
          {reviewError && <Alert severity="error" sx={{ mb: 2 }}>{reviewError.data?.message}</Alert>}
          <Box
            component="form"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await createReview({ contractId: contract._id, rating: reviewRating, comment: reviewComment }).unwrap();
                setReviewedThisSession(true);
              } catch {
                // handled by reviewError above
              }
            }}
            sx={{ mb: 3 }}
          >
            <Rating value={reviewRating} onChange={(e, val) => setReviewRating(val)} sx={{ mb: 1 }} />
            <TextField
              fullWidth
              multiline
              minRows={2}
              placeholder="Share your experience..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Button type="submit" variant="contained" disabled={reviewSubmitting}>
              {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </Box>
        </>
      )}

      {conversationData?.data?.conversation && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>Chat</Typography>
          <ChatBox conversationId={conversationData.data.conversation._id} />
        </>
      )}

      <Dialog open={!!disputeTarget} onClose={() => setDisputeTarget(null)}>
        <DialogTitle>Raise a Dispute</DialogTitle>
        <DialogContent>
          {disputeError && <Alert severity="error" sx={{ mb: 2 }}>{disputeError.data?.message}</Alert>}
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            sx={{ mt: 1 }}
            placeholder="Explain what went wrong..."
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisputeTarget(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            disabled={disputing || !disputeReason.trim()}
            onClick={async () => {
              try {
                await raiseDispute({ contractId: contract._id, milestoneId: disputeTarget, reason: disputeReason }).unwrap();
                setDisputeTarget(null);
              } catch {
                // handled by disputeError above
              }
            }}
          >
            {disputing ? 'Submitting...' : 'Submit Dispute'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
