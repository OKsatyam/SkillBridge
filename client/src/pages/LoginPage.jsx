import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Alert, Link } from '@mui/material';
import { useLoginMutation } from '../features/auth/authApi';
import { setCredentials } from '../features/auth/authSlice';
import { loginSchema } from '../features/auth/authSchemas';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(loginSchema) });
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (formData) => {
    try {
      const res = await login(formData).unwrap();
      dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }));
      navigate('/');
    } catch {
      // RTK Query's `error` state below already captures and displays this
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <Paper sx={{ p: 4, width: 380 }} elevation={2}>
        <Typography variant="h5" mb={3} fontWeight={600}>Log in to SkillBridge</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error.data?.message || 'Login failed'}</Alert>}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField label="Email" fullWidth margin="normal" {...register('email')}
            error={!!errors.email} helperText={errors.email?.message} />
          <TextField label="Password" type="password" fullWidth margin="normal" {...register('password')}
            error={!!errors.password} helperText={errors.password?.message} />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log In'}
          </Button>
        </Box>
        <Typography mt={2} variant="body2">
          Don't have an account? <Link component={RouterLink} to="/register">Register</Link>
        </Typography>
      </Paper>
    </Box>
  );
}