import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Alert, Link } from '@mui/material';
import { useRegisterMutation } from '../features/auth/authApi';
import { setCredentials } from '../features/auth/authSlice';
import { registerSchema } from '../features/auth/authSchemas';

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(registerSchema) });
  const [registerUser, { isLoading, error }] = useRegisterMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async ({ confirmPassword, ...formData }) => {
    try {
      const res = await registerUser(formData).unwrap();
      dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }));
      navigate('/');
    } catch {
      // handled by `error` below
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <Paper sx={{ p: 4, width: 380 }} elevation={2}>
        <Typography variant="h5" mb={3} fontWeight={600}>Create your SkillBridge account</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error.data?.message || 'Registration failed'}</Alert>}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField label="Name" fullWidth margin="normal" {...register('name')}
            error={!!errors.name} helperText={errors.name?.message} />
          <TextField label="Email" fullWidth margin="normal" {...register('email')}
            error={!!errors.email} helperText={errors.email?.message} />
          <TextField label="Password" type="password" fullWidth margin="normal" {...register('password')}
            error={!!errors.password} helperText={errors.password?.message} />
          <TextField label="Confirm Password" type="password" fullWidth margin="normal" {...register('confirmPassword')}
            error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Register'}
          </Button>
        </Box>
        <Typography mt={2} variant="body2">
          Already have an account? <Link component={RouterLink} to="/login">Log In</Link>
        </Typography>
      </Paper>
    </Box>
  );
}