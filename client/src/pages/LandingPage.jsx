import { Box, Typography, Button, Grid, Container, Stack, Avatar } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import WorkOutlineIcon from '@mui/icons-material/WorkOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';

const FEATURES = [
  {
    icon: WorkOutlineIcon,
    title: 'Gigs & Jobs',
    description: 'Sell fixed-price gig packages, or post open jobs and review proposals from freelancers.',
  },
  {
    icon: PaymentsOutlinedIcon,
    title: 'Escrow-backed payments',
    description: 'Funds are held in escrow per milestone and released only once work is approved.',
  },
  {
    icon: ChatBubbleOutlineIcon,
    title: 'Real-time chat',
    description: 'Message your client or freelancer directly on every contract, with live delivery updates.',
  },
  {
    icon: VerifiedOutlinedIcon,
    title: 'Reviews you can trust',
    description: 'Two-way ratings after every completed contract keep both sides accountable.',
  },
];

export default function LandingPage() {
  return (
    <Box>
      <Box
        sx={{
          background: 'linear-gradient(180deg, #EEF2FF 0%, #F9FAFB 100%)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center', py: { xs: 8, md: 12 } }}>
          <Typography variant="h2" sx={{ fontSize: { xs: 34, md: 48 }, mb: 2 }}>
            Hire talent. Sell your skills.
            <Box component="span" sx={{ color: 'primary.main' }}> All in one place.</Box>
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={400} sx={{ maxWidth: 560, mx: 'auto', mb: 4 }}>
            SkillBridge connects clients and freelancers through gigs, jobs, and a secure
            escrow-backed wallet — so every project gets paid for, on time.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button component={RouterLink} to="/gigs" variant="contained" size="large">
              Browse Gigs
            </Button>
            <Button component={RouterLink} to="/jobs" variant="outlined" size="large">
              Browse Jobs
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={3}>
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Grid item xs={12} sm={6} md={3} key={title}>
              <Stack spacing={1.5} sx={{ height: '100%' }}>
                <Avatar sx={{ bgcolor: 'rgba(67,56,202,0.08)', color: 'primary.main', width: 44, height: 44 }}>
                  <Icon fontSize="small" />
                </Avatar>
                <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
                <Typography variant="body2" color="text.secondary">{description}</Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
