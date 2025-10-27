# Login Page

A simple HTML login interface for the Text Summarizer API.

## Features

- **Login & Register**: Switch between login and registration forms
- **Authentication**: Secure login using email and password
- **Token Management**: Automatic token storage and refresh
- **User Dashboard**: View user information after successful login
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Clear error messages for various scenarios

## Usage

1. **Access the Login Page**:
   - Visit `http://localhost:3000/` (redirects to login page)
   - Or directly access `http://localhost:3000/login.html`
   - Or visit `http://localhost:3000/login`

2. **Register a New Account**:
   - Click the "Register" tab
   - Fill in your name, email, and password (minimum 8 characters)
   - Click "Register" button
   - Upon successful registration, you'll be automatically logged in

3. **Login with Existing Account**:
   - Use the "Login" tab (default)
   - Enter your email and password
   - Click "Login" button
   - Upon successful login, you'll see your user dashboard

4. **User Dashboard**:
   - View your profile information
   - See account details like email verification status
   - Logout when finished

## API Integration

The login page integrates with the following API endpoints:

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh-tokens` - Token refresh

## Security Features

- HTTPS support (when deployed with SSL)
- Secure token storage in localStorage
- Automatic token refresh
- Content Security Policy (CSP) headers
- XSS protection
- Rate limiting on authentication endpoints (in production)

## Browser Compatibility

Compatible with all modern browsers including:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

- **Network Errors**: Ensure the backend server is running
- **401 Errors**: Check email/password credentials
- **422 Errors**: Verify all required fields are filled correctly
- **CORS Issues**: The backend is configured to accept requests from any origin in development