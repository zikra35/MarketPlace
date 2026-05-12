# Admin Seller Management System - Complete Implementation

## Overview
The admin seller management system now provides complete control over seller accounts with approval, warning, suspension, and deletion capabilities all through the database.

## Database Model Updates

### User Model Enhanced Fields (`backend/src/models/User.js`)
- `sellerStatus`: enum ['pending', 'approved', 'rejected', 'suspended']
- `warningsCount`: Number (tracks total warnings)
- `warnings`: Array of warning objects with:
  - `reason`: String
  - `issuedAt`: Date
  - `issuedBy`: Admin ID reference
- `isSuspended`: Boolean
- `suspensionReason`: String
- `suspendedAt`: Date
- `totalSales`: Number
- `rating`: Number

## Backend API Endpoints

### All endpoints require admin authentication

#### Seller Monitoring
- **GET** `/admin/sellers` - Get all sellers with filters
  - Query params: `page`, `limit`, `status` (all/pending/approved/suspended/rejected), `isSuspended`
  
- **GET** `/admin/sellers/:id` - Get specific seller details with stats

#### Seller Approval
- **PATCH** `/admin/sellers/:id/approve` - Approve a pending seller
- **PATCH** `/admin/sellers/:id/reject` - Reject a pending seller

#### Seller Warnings
- **PATCH** `/admin/sellers/:id/warn` - Issue a warning to seller
  - Body: `{ reason: string }`
  - Auto-suspends after 3 warnings
  
- **PATCH** `/admin/sellers/:id/warning/:warningIndex/remove` - Remove a specific warning
  - Auto-unsuspends if warnings < 3

#### Seller Suspension
- **PATCH** `/admin/sellers/:id/suspend` - Suspend a seller
  - Body: `{ reason: string }`
  
- **PATCH** `/admin/sellers/:id/unsuspend` - Unsuspend a seller

#### Seller Deletion
- **DELETE** `/admin/sellers/:id` - Delete seller and all their products

#### Existing Endpoints (Also Available)
- **GET** `/admin/sellers/pending` - Get pending seller applications
- **GET** `/admin/stats` - Get marketplace statistics

## Frontend Features

### Seller Management Page (`src/routes/admin/sellers.tsx`)

#### Dashboard Stats
- Total Sellers count
- Pending Approvals count
- Approved Sellers count
- Suspended Sellers count

#### Filtering & Search
- **Status Filter**: All, Pending Approval, Approved, Suspended, Rejected
- **Search**: By seller name, email, or store name
- **Pagination**: 10 sellers per page

#### Inline Actions (Table View)
- **View Details** - Opens detailed seller modal
- **Approve** ✅ - Available for pending sellers
- **Reject** ❌ - Available for pending sellers
- **Warn** ⚠️ - Available for approved sellers
- **Suspend** 🔒 - Available for approved sellers
- **Unsuspend** 🔓 - Available for suspended sellers
- **Delete** 🗑️ - Available for all sellers

#### Detailed Seller Modal
- **Personal Information**
  - Full Name, Email, Phone
  - Application Date
  
- **Store Information**
  - Store Name
  - Address
  - Current Status
  
- **Warnings Section**
  - Total warning count
  - List of all warnings with:
    - Reason
    - Issue date & time
    - Remove button (per warning)
  
- **Performance Stats**
  - Total Sales
  - Rating/Review Average
  
- **Action Buttons**
  - Context-aware actions based on seller status
  - Approve, Reject, Warn, Suspend, Unsuspend, Delete

#### Export Functionality
- Export sellers as CSV
- Export sellers as JSON

## API Client Updates (`src/lib/apiClient.ts`)

New admin API methods added:
```typescript
adminApi.getAllSellers(filters?)        // Get all sellers
adminApi.getSellerDetails(id)           // Get seller details
adminApi.warnSeller(id, reason?)        // Issue warning
adminApi.removeWarning(id, index)       // Remove specific warning
adminApi.suspendSeller(id, reason?)     // Suspend seller
adminApi.unsuspendSeller(id)            // Unsuspend seller
adminApi.deleteSeller(id)               // Delete seller
```

## Business Logic

### Automatic Suspension
- When a seller receives 3 warnings, they are automatically suspended
- `sellerStatus` changes to 'suspended'
- `isSuspended` flag is set to true

### Warning Removal
- Admins can remove individual warnings
- If warnings drop below 3, suspended sellers are automatically unsuspended
- Seller status returns to 'approved'

### Seller Deletion
- Deletes the seller user account
- Cascades and deletes ALL products by that seller
- Cannot be undone

### Status Flow
```
pending → approved → (can warn/suspend) → suspended → (can unsuspend)
↓
rejected (terminal state)
↓ (or direct delete)
deleted
```

## Usage Workflow

### Step 1: Approve/Reject Pending Sellers
1. Navigate to Admin → Seller Management
2. Filter by "Pending Approval"
3. Click "Approve" or "Reject" for each seller

### Step 2: Monitor Active Sellers
1. Filter by "Approved"
2. View seller details for performance metrics
3. Check warning status

### Step 3: Issue Warnings
1. Click "Warn" button or open seller detail modal
2. Enter warning reason
3. Confirm warning issuance
4. Seller receives warning (3 warnings = auto-suspension)

### Step 4: Manage Suspended Sellers
1. Filter by "Suspended"
2. View suspension reason
3. Either unsuspend or permanently delete
4. To remove warning, open details and click "Remove" on warning

### Step 5: Delete Sellers
1. Open seller details
2. Click "Delete Seller & Products"
3. Confirm deletion (cannot be undone)

## Database Queries Performance

All endpoints include:
- Proper pagination (default 10 items)
- Indexed queries on `role`, `email`, `sellerStatus`
- Efficient filtering by status and suspension state
- Select exclusions for sensitive data (password, refreshToken)

## Security

✅ All admin actions require:
- Authentication
- Admin role verification
- Proper validation of inputs
- Error handling and logging

✅ Sensitive data protection:
- Passwords never returned
- Refresh tokens never returned

## Testing Checklist

- [ ] Approve pending sellers
- [ ] Reject pending sellers
- [ ] Issue warnings to sellers (test 3-warning auto-suspension)
- [ ] Remove warnings (test auto-unsuspend at <3 warnings)
- [ ] Suspend approved sellers
- [ ] Unsuspend suspended sellers
- [ ] Delete sellers (verify products deleted too)
- [ ] Monitor sellers with filtered views
- [ ] Search functionality
- [ ] Pagination
- [ ] Export CSV/JSON
- [ ] Status badges display correctly
- [ ] All buttons disabled during processing

## Next Steps (Optional Enhancements)

- Email notifications to sellers on warnings/suspension
- Seller appeal/review system
- Automated warning expiry after 30 days
- Bulk actions (approve/reject multiple)
- Warning history/audit log
- Seller performance metrics dashboard
- Automatic deletion of accounts with multiple warnings

---
**Last Updated**: May 11, 2026
**Status**: Ready for Testing
