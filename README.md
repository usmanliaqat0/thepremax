# ThePreMax - Premium E-commerce Platform

A modern multi category eCommerce platform built with Next.js, featuring a powerful admin dashboard and seamless user management.

## Key Features

### Shopping Experience

- **Product Catalog**: Browse products across multiple categories with detailed product pages
- **Advanced Search & Filtering**: Find products quickly with category filters and search functionality
- **Product Variants**: Support for different sizes, colors, and product specifications
- **Product Reviews & Ratings**: Customer feedback system with star ratings
- **Wishlist Management**: Save favorite products for later purchase
- **Shopping Cart**: Persistent cart with quantity management and size/color selection
- **Promo Codes**: Apply discount codes during checkout (e.g., WELCOME10 for 10% off)

### User Account Management

- **User Registration & Login**: Secure authentication system
- **Email Verification**: Required email verification for account activation
- **Password Reset**: Forgot password functionality with secure token-based reset
- **User Profiles**: Comprehensive profile management with avatar upload
- **Address Management**: Multiple shipping and billing addresses
- **Order History**: Complete order tracking and history
- **Account Settings**: Personal information and security preferences

### Order Management

- **Secure Checkout**: Multi-step checkout process with form validation
- **Order Tracking**: Real-time order status updates and tracking information
- **Order Invoices**: Downloadable PDF invoices for completed orders
- **Order Status Updates**: Automated notifications for order status changes
- **Payment Processing**: Support for multiple payment methods
- **Shipping Management**: Address validation and shipping cost calculation

### Admin Dashboard

- **Product Management**: Add, edit, and manage products with image uploads
- **Category Management**: Organize products into categories and subcategories
- **Order Management**: Process orders, update status, and manage fulfillment
- **User Management**: View and manage customer accounts
- **Analytics Dashboard**: Sales statistics and business metrics
- **Message Management**: Handle customer inquiries and support requests
- **Subscription Management**: Manage email newsletter subscriptions

### Customer Support

- **Contact Forms**: Multiple ways to reach customer support
- **FAQ Section**: Comprehensive frequently asked questions
- **Email Support**: Direct email contact with support team
- **Order Support**: Help with order-related inquiries
- **Return Policy**: Clear return and refund policies

### Additional Features

- **Newsletter Subscription**: Email marketing and updates
- **Responsive Design**: Optimized for all devices and screen sizes
- **SEO Optimized**: Built-in SEO features for better search visibility
- **File Upload System**: Secure image and file upload capabilities
- **Email Notifications**: Automated email system for orders and updates
- **Data Export**: Export functionality for orders and customer data

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

### Frontend

- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS with custom design system
- **UI Components:** Radix UI primitives for accessible components
- **Icons:** Lucide React icon library
- **State Management:** React Context API for cart, wishlist, and authentication
- **Forms:** Custom form components with validation

### Backend

- **Runtime:** Node.js with Next.js API routes
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT tokens with bcrypt password hashing
- **File Upload:** Multer for handling image uploads
- **Email Service:** Nodemailer with Brevo integration

### Development Tools

- **Language:** TypeScript for type safety
- **Linting:** ESLint with Next.js configuration
- **Package Manager:** npm
- **Version Control:** Git

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes for backend functionality
│   ├── cart/              # Shopping cart page
│   ├── checkout/          # Checkout process
│   ├── contact/           # Contact and support pages
│   ├── profile/           # User profile management
│   ├── shop/              # Product catalog
│   └── wishlist/          # User wishlist
├── components/            # Reusable React components
│   ├── admin/             # Admin-specific components
│   ├── profile/           # Profile management components
│   └── ui/                # Base UI components
├── context/               # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and services
│   ├── models/            # Database models
│   └── types.ts           # TypeScript type definitions
└── public/                # Static assets and uploads
```

## Environment Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables for MongoDB, email service, and JWT secrets
4. Run the development server: `npm run dev`
5. Access the application at `http://localhost:3000`

## Key Dependencies

- **Next.js 15**: React framework with App Router
- **MongoDB**: Database for storing products, users, and orders
- **Mongoose**: Object modeling for MongoDB
- **JWT**: Authentication and authorization
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Sonner**: Toast notifications
- **Date-fns**: Date manipulation utilities
