# Employee Activity Tracking System

## Overview
A comprehensive employee activity tracking system that monitors and logs all actions performed by employees in the store management system.

## Features

### 🔍 **Activity Monitoring**
- Tracks CREATE, UPDATE, and DELETE operations
- Monitors activities across sales, purchases, and user management
- Records detailed information including old/new data, IP addresses, and user agents

### 👥 **Employee Selection**
- Filter activities by specific employees or view all activities
- Real-time employee statistics
- Role-based access control (Admin only)

### 📊 **Comprehensive Tracking**
- **Sales Activities**: Creation, modification, and deletion of sales records
- **Purchase Activities**: Creation, modification, and deletion of purchase records  
- **User Management**: User creation, updates, and role changes
- **Detailed Logging**: Captures before/after data states for all modifications

### 📈 **Analytics Dashboard**
- Total activities count
- Active employees count
- Recent activities (today)
- Current filter status

## Database Schema

### Activity Logs Table
```sql
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT REFERENCES utilisateurs(id) ON DELETE CASCADE,
    action_type VARCHAR(50) CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE')),
    table_name VARCHAR(50) CHECK (table_name IN ('ventes', 'achats', 'utilisateurs')),
    record_id INT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    details TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Implementation Structure

### 🏗️ **Architecture**
```
src/
├── app/
│   ├── api/tracking/              # API endpoints for activity retrieval
│   └── dashboard/tracking/        # Main tracking interface
├── components/
│   └── tables/
│       └── activity-tracking-table.tsx  # Activity display component
├── hooks/
│   └── use-tracking.ts           # React hooks for data fetching
├── lib/
│   └── activity-logger.ts        # Core logging functionality
└── types/
    └── database.types.ts         # TypeScript definitions
```

### 🔧 **Key Components**

#### 1. Activity Logger (`src/lib/activity-logger.ts`)
- Core logging functionality
- Automatic IP and user agent detection
- Detailed activity formatting
- Error handling and resilience

#### 2. Tracking API (`src/app/api/tracking/route.ts`)
- RESTful API for activity retrieval
- Employee filtering
- Pagination support
- Admin-only access control

#### 3. Tracking Dashboard (`src/app/dashboard/tracking/page.tsx`)
- Interactive employee selector
- Real-time statistics
- Modern, responsive UI
- Activity filtering and search

#### 4. Activity Table (`src/components/tables/activity-tracking-table.tsx`)
- Detailed activity display
- Modal for comprehensive activity details
- Pagination controls
- Action type indicators

## Usage

### 🚀 **Setup Instructions**

1. **Database Setup**
   ```sql
   -- Run this in your Supabase SQL Editor
   -- See tracking-system-setup.sql for complete setup
   ```

2. **Access the Tracking System**
   - Navigate to `/dashboard/tracking` as an admin user
   - Select an employee or view all activities
   - Click on any activity for detailed information

### 📱 **User Interface**

#### Main Dashboard
- **Employee Filter**: Select specific employees or view all
- **Statistics Cards**: Key metrics and activity counts
- **Activity Timeline**: Chronological list of all activities

#### Activity Details Modal
- **General Information**: User, action type, table, timestamp
- **Technical Details**: IP address, user agent, record ID
- **Data Changes**: Before/after comparison for modifications

### 🔐 **Security Features**

#### Row Level Security (RLS)
- Activity logs are only accessible by admin users
- Employee data is properly protected
- Secure API endpoints with authentication

#### Data Privacy
- Sensitive information is properly handled
- User agents and IP addresses are logged for security
- Audit trail for compliance requirements

## Data Tracking Examples

### Sales Activity
```json
{
  "action_type": "CREATE",
  "table_name": "ventes",
  "details": "Vente créée pour le client: Jean Dupont - Total: 150.00€",
  "new_data": {
    "nom_client": "Jean Dupont",
    "total": 150.00,
    "lignes_vente": [...]
  }
}
```

### User Modification
```json
{
  "action_type": "UPDATE", 
  "table_name": "utilisateurs",
  "details": "Utilisateur modifié: Marie Martin (employe)",
  "old_data": { "role": "employe" },
  "new_data": { "role": "admin" }
}
```

## API Endpoints

### GET `/api/tracking`
Retrieve activity logs with filtering and pagination.

**Parameters:**
- `employeeId`: Filter by specific employee (optional)
- `page`: Page number for pagination (default: 1)  
- `limit`: Number of records per page (default: 50)

**Response:**
```json
{
  "activities": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

## Performance Considerations

### Database Optimization
- Indexed on `utilisateur_id`, `table_name`, `action_type`, `created_at`
- Efficient pagination queries
- JSONB for flexible data storage

### Frontend Performance  
- React Query for efficient data caching
- Pagination to limit data transfer
- Optimistic UI updates

## Monitoring and Maintenance

### Log Retention
- Consider implementing log rotation for large datasets
- Archive old logs based on compliance requirements
- Monitor storage usage

### Performance Monitoring
- Track API response times
- Monitor database query performance
- Set up alerts for unusual activity patterns

## Future Enhancements

### Potential Features
- **Export Functionality**: CSV/Excel export of activity logs
- **Advanced Filtering**: Date ranges, activity types, search
- **Real-time Updates**: WebSocket integration for live activity feeds
- **Compliance Reports**: Automated audit reports
- **Activity Alerts**: Notifications for suspicious activities

### Technical Improvements
- **Batch Processing**: Bulk activity logging for better performance
- **Data Compression**: Compress old activity data
- **Advanced Analytics**: Trends and patterns analysis
- **Mobile Support**: Enhanced mobile interface

---

## 🎯 **Summary**

The Employee Activity Tracking System provides comprehensive monitoring of all employee actions within the store management system. It offers:

✅ **Complete Activity Logging** - Every CREATE, UPDATE, DELETE operation is tracked  
✅ **Admin Dashboard** - Easy-to-use interface for viewing and filtering activities  
✅ **Detailed Audit Trail** - Before/after data comparison for all modifications  
✅ **Security & Compliance** - Role-based access and audit capabilities  
✅ **Performance Optimized** - Indexed database queries and efficient pagination  
✅ **Modern UI/UX** - Responsive design with intuitive navigation  

The system ensures accountability, enhances security, and provides valuable insights into employee behavior and system usage patterns.