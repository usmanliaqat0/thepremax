# Admin System Setup Guide

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Super Admin Credentials (Hardcoded - Only Super Admin)
SUPER_ADMIN_EMAIL=superadmin@thepremax.com
SUPER_ADMIN_PASSWORD=SuperAdmin123!

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Database
MONGODB_URI=mongodb://localhost:27017/thepremax
```

## Admin System Overview

### Super Admin

- **Hardcoded in environment variables**
- Has ALL permissions including admin management
- Can create, update, and delete other admin accounts
- Can reset passwords for all admin accounts
- Cannot be deleted or modified through the admin panel
- Must use admin login portal at `/admin/login`

### Regular Admin

- **Stored in database**
- Has limited permissions (no admin management)
- Cannot create, update, or delete other admin accounts
- Cannot reset passwords
- Must use admin login portal at `/admin/login`

## Key Features

### 1. Separate Login Systems

- **Normal users**: Use `/login` (restricted from admin accounts)
- **Admin users**: Use `/admin/login` (both super admin and regular admin)

### 2. Permission System

- Super admin has all permissions automatically
- Regular admins have predefined permissions (no admin management)
- UI components respect permission restrictions

### 3. Admin Management (Super Admin Only)

- Create new admin accounts: `POST /api/admin/auth/create-admin`
- Reset admin passwords: `POST /api/admin/auth/reset-password`
- View all admins: `/admin/admins`

### 4. Security Features

- Admin accounts cannot login through normal login page
- Super admin credentials are hardcoded in environment
- Regular admin accounts are stored in database with hashed passwords
- JWT tokens with proper expiration

## Usage

### Super Admin Login

1. Go to `/admin/login`
2. Use credentials from `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD`
3. Access all admin features including admin management

### Regular Admin Login

1. Go to `/admin/login`
2. Use credentials created by super admin
3. Access limited admin features (no admin management)

### Creating New Admin

1. Login as super admin
2. Go to `/admin/admins`
3. Click "Create New Admin"
4. Fill in admin details
5. Admin account is created with default permissions

### Resetting Admin Password

1. Login as super admin
2. Go to `/admin/admins`
3. Find the admin to reset
4. Click "Reset Password"
5. Enter new password
6. Password is updated immediately

## API Endpoints

### Admin Authentication

- `POST /api/admin/auth/signin` - Admin login
- `POST /api/admin/auth/create-admin` - Create new admin (super admin only)
- `POST /api/admin/auth/reset-password` - Reset admin password (super admin only)

### Admin Management

- `GET /api/admin/admins` - List all admins
- `PUT /api/admin/admins/[id]` - Update admin
- `DELETE /api/admin/admins/[id]` - Delete admin

## Security Notes

1. **Super Admin Credentials**: Store securely in environment variables
2. **Password Strength**: All passwords must meet security requirements
3. **Token Expiration**: JWT tokens expire after 7 days by default
4. **Admin Isolation**: Admin accounts cannot access normal user features
5. **Permission Checks**: All admin actions are protected by permission checks
