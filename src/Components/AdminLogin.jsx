import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  LockOutlined,
  Visibility,
  VisibilityOff,
  AlternateEmail,
  LoginOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'https://api.cashamsalone.com';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '', // Changed to empty string
    password: '', // Changed to empty string
  });
  const [error, setError] = useState('');

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleChange = (e) => {
    setError('');
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  try {
    const formData = new URLSearchParams();
    formData.append('email', credentials.email);
    formData.append('password', credentials.password);

    const response = await axios.post(
      `${API_BASE_URL}/admin/login`,
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      }
    );

    console.log('Login response:', response.data);

    if (response.data) {

      // Save token
      localStorage.setItem('adminToken', response.data.token);

      // Save user data
      localStorage.setItem('adminUser', JSON.stringify(response.data.data));

      setIsSuccess(true);
      setTimeout(() => navigate('/admin/dashboard'), 1500);
    }

  } catch (err) {
    console.error("Login error details:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      fullError: err,
    });

    setError(
      err.response?.data?.message ||
      err.response?.data ||
      err.message ||
      "Login failed. Please try again."
    );

  } finally {
    setIsLoading(false);
  }
};




  const LoadingOverlay = () => (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(8px)',
      }}
    >
      {isSuccess ? (
        <Box
          sx={{
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-out',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(-20px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Box
            sx={{
              width: 100,
              height: 100,
              position: 'relative',
              margin: '0 auto 20px',
              '&::before': {
                content: '""',
                position: 'absolute',
                border: '4px solid #4CAF50',
                borderRadius: '50%',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                animation: 'ripple 1s linear infinite',
              },
              '&::after': {
                content: '"✓"',
                color: '#4CAF50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '50px',
                height: '100%',
                animation: 'checkmark 0.8s ease-in-out forwards',
              },
            }}
          />
          <Typography
            variant="h4"
            sx={{
              color: '#4CAF50',
              fontWeight: 600,
              mb: 2,
              textShadow: '0 0 10px rgba(76, 175, 80, 0.3)',
            }}
          >
            Login Successful!
          </Typography>
          <Typography
            sx={{
              color: '#fff',
              animation: 'pulse 1.5s infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 0.6 },
                '50%': { opacity: 1 },
              },
            }}
          >
            Redirecting to Dashboard...
          </Typography>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', position: 'relative' }}>
          <Box
            sx={{
              display: 'inline-block',
              position: 'relative',
              width: '80px',
              height: '80px',
              '& div': {
                position: 'absolute',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#fff',
                animation: 'cube 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite',
              },
              '& div:nth-of-type(1)': {
                left: '8px',
                animationDelay: '-0.24s',
              },
              '& div:nth-of-type(2)': {
                left: '32px',
                animationDelay: '-0.12s',
              },
              '& div:nth-of-type(3)': {
                left: '56px',
                animationDelay: '0',
              },
              '@keyframes cube': {
                '0%': {
                  top: '8px',
                  height: '64px',
                },
                '50%, 100%': {
                  top: '24px',
                  height: '32px',
                },
              },
            }}
          >
            <div></div>
            <div></div>
            <div></div>
          </Box>
          <Typography
            variant="h5"
            sx={{
              color: '#fff',
              mt: 4,
              position: 'relative',
              '&::after': {
                content: '""',
                animation: 'loading 1s infinite',
              },
              '@keyframes loading': {
                '0%': { content: '"."' },
                '33%': { content: '".."' },
                '66%': { content: '"..."' },
              },
            }}
          >
            Authenticating
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >
      {(isLoading || isSuccess) && <LoadingOverlay />}
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          }}
        >
          <Box
            sx={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #1e3c72 30%, #2a5298 90%)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 2,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '150%',
                height: '150%',
                background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)',
                transform: 'rotate(45deg)',
                top: '-25%',
                left: '-25%',
                animation: 'shine 3s infinite',
              },
              '@keyframes shine': {
                '0%': { transform: 'rotate(45deg) translateX(-150%)' },
                '50%': { transform: 'rotate(45deg) translateX(0)' },
                '100%': { transform: 'rotate(45deg) translateX(150%)' },
              },
              '&:hover': {
                transform: 'scale(1.05)',
                transition: 'transform 0.3s ease',
              },
            }}
          >
            <LockOutlined 
              sx={{ 
                color: 'white', 
                fontSize: 35,
                animation: 'bounce 2s infinite',
                '@keyframes bounce': {
                  '0%, 20%, 50%, 80%, 100%': {
                    transform: 'translateY(0)',
                  },
                  '40%': {
                    transform: 'translateY(-10px)',
                  },
                  '60%': {
                    transform: 'translateY(-5px)',
                  },
                },
              }} 
            />
          </Box>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 3,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1e3c72 30%, #2a5298 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Admin Login
          </Typography>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                width: '100%',
                animation: 'shake 0.5s',
                '@keyframes shake': {
                  '0%, 100%': { transform: 'translateX(0)' },
                  '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
                  '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
                },
              }}
            >
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              // Removed autoComplete="email"
              // Removed value={credentials.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AlternateEmail sx={{ color: '#1e3c72' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#1e3c72',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2a5298',
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              // Removed autoComplete="current-password"
              // Removed value={credentials.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: '#1e3c72' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      sx={{ color: '#1e3c72' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#1e3c72',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2a5298',
                  },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              startIcon={<LoginOutlined />}
              sx={{
                mt: 3,
                mb: 2,
                height: '48px',
                background: 'linear-gradient(45deg, #1e3c72 30%, #2a5298 90%)',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease-in-out',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 6px 10px 4px rgba(30, 60, 114, .4)',
                  '&::before': {
                    left: '100%',
                  },
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent)',
                  animation: 'shine 3s infinite',
                },
                '&:active': {
                  transform: 'scale(0.98)',
                },
                '&.Mui-disabled': {
                  background: 'linear-gradient(45deg, #1e3c72 30%, #2a5298 90%)',
                  opacity: 0.7,
                },
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminLogin;