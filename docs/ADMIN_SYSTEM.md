# Admin System Documentation

## Overview

The admin system provides role-based access control with granular permissions for managing the application. It includes a super admin (hardcoded) and regular admins stored in the database.

## Features

- **Super Admin**: Hardcoded credentials with full access to all features
- **Role-based Access Control**: Different admin roles with specific permissions
- **Permission System**: Granular permissions for different sections
- **Admin Management**: CRUD operations for admin accounts
- **Secure Authentication**: JWT-based authentication with HTTP-only cookies

## Admin Roles

### 1. Super Admin

- **Access**: Full access to all features
- **Credentials**: Hardcoded in environment variables
- **Permissions**: All permissions enabled
- **Can**: Create, update, delete other admins

### 2. Admin

- **Access**: Most features except admin management
- **Permissions**: Full access to users, products, categories, orders, etc.
- **Cannot**: Manage other admins

### 3. Moderator

- **Access**: Limited administrative access
- **Permissions**: View and update most content, limited delete permissions
- **Cannot**: Create/delete users, manage admins

### 4. Viewer

- **Access**: Read-only access
- **Permissions**: View-only permissions for all sections
- **Cannot**: Create, update, or delete anything

## Permission System

The permission system is organized by sections:

### Dashboard

- `view`: Access to admin dashboard

### Users

- `view`: View user list
- `create`: Create new users
- `update`: Update user information
- `delete`: Delete users
- `export`: Export user data

### Products

- `view`: View product list
- `create`: Create new products
- `update`: Update product information
- `delete`: Delete products
- `export`: Export product data

### Categories

- `view`: View category list
- `create`: Create new categories
- `update`: Update category information
- `delete`: Delete categories

### Orders

- `view`: View order list
- `update`: Update order status
- `delete`: Delete orders
- `export`: Export order data

### Promo Codes

- `view`: View promo codes
- `create`: Create new promo codes
- `update`: Update promo codes
- `delete`: Delete promo codes

### Subscriptions

- `view`: View subscriptions
- `update`: Update subscription status
- `export`: Export subscription data

### Messages

- `view`: View contact messages
- `update`: Update message status
- `delete`: Delete messages

### Admins (Super Admin only)

- `view`: View admin list
- `create`: Create new admins
- `update`: Update admin information
- `delete`: Delete admins

### Statistics

- `view`: View statistics
- `export`: Export statistics

## API Endpoints

### Authentication

- `POST /api/admin/auth/signin` - Admin sign in

### Admin Management

- `GET /api/admin/admins` - List admins (with pagination and filters)
- `POST /api/admin/admins` - Create new admin
- `GET /api/admin/admins/[id]` - Get admin details
- `PUT /api/admin/admins/[id]` - Update admin
- `DELETE /api/admin/admins/[id]` - Delete admin

## Environment Variables

Add these to your `.env` file:

```env
# Super Admin Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password

# JWT Secrets
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

## Usage

### 1. Super Admin Login

1. Navigate to `/admin/login`
2. Use the super admin credentials from environment variables
3. Access the admin dashboard with full permissions

### 2. Create New Admins

1. Login as super admin
2. Navigate to "Admins" section
3. Click "Create Admin"
4. Fill in admin details and set permissions
5. Save the admin

### 3. Manage Permissions

1. Edit any admin account
2. Modify permissions in the permissions section
3. Save changes

## Security Features

- **HTTP-only Cookies**: Tokens stored in secure cookies
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Permission Validation**: Server-side permission checks
- **Route Protection**: Client and server-side route protection

## Database Schema

### Admin Collection

```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  avatar: String (optional),
  role: String (super_admin|admin|moderator|viewer),
  permissions: {
    dashboard: { view: Boolean },
    users: { view: Boolean, create: Boolean, update: Boolean, delete: Boolean, export: Boolean },
    // ... other sections
  },
  status: String (active|inactive|suspended),
  lastLogin: Date,
  createdBy: ObjectId (reference to Admin),
  createdAt: Date,
  updatedAt: Date
}
```

## Testing

Run the test script to verify the admin system:

```bash
node scripts/test-admin-system.js
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check if the admin has the required permissions
2. **Login Failed**: Verify super admin credentials in environment variables
3. **Route Access Denied**: Ensure the admin has view permission for the route
4. **Token Expired**: Re-login to get new tokens

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

## Future Enhancements

- [ ] Two-factor authentication
- [ ] Audit logging
- [ ] Bulk admin operations
- [ ] Custom permission sets
- [ ] Admin activity monitoring
