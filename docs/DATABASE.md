# Database Management Guide

## Overview
This guide covers MongoDB database management, including setup, maintenance, backups, and optimization.

## Database Architecture

### 1. Collections Structure
```javascript
// cases collection
{
  _id: ObjectId,
  title: String,
  description: String,
  severity: String,
  status: String,
  assignee: ObjectId,
  created_at: ISODate,
  updated_at: ISODate,
  tags: Array<String>,
  metadata: Object
}

// alerts collection
{
  _id: ObjectId,
  type: String,
  source: String,
  severity: String,
  message: String,
  timestamp: ISODate,
  case_id: ObjectId,
  resolved: Boolean,
  resolution: String
}

// users collection
{
  _id: ObjectId,
  email: String,
  name: String,
  role: String,
  settings: Object,
  created_at: ISODate,
  last_login: ISODate
}
```

### 2. Indexes
```javascript
// Performance Indexes
db.cases.createIndex({ "created_at": 1 });
db.cases.createIndex({ "status": 1, "severity": 1 });
db.cases.createIndex({ "assignee": 1 });
db.cases.createIndex({ "tags": 1 });

db.alerts.createIndex({ "timestamp": 1 });
db.alerts.createIndex({ "case_id": 1 });
db.alerts.createIndex({ "severity": 1, "resolved": 1 });

db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });

// Text Search Indexes
db.cases.createIndex({
  title: "text",
  description: "text",
  tags: "text"
});

// TTL Index for Audit Logs
db.audit_logs.createIndex({ "created_at": 1 }, { expireAfterSeconds: 7776000 }); // 90 days
```

## Database Operations

### 1. Backup Procedures
```bash
#!/bin/bash
# scripts/backup_db.sh

# Configuration
BACKUP_DIR="/var/backups/mongodb"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
MONGODB_URI="mongodb://localhost:27017/jupiter"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
mongodump --uri $MONGODB_URI --out $BACKUP_DIR/$DATE

# Compress backup
cd $BACKUP_DIR
tar -czf $DATE.tar.gz $DATE
rm -rf $DATE

# Upload to S3
aws s3 cp $DATE.tar.gz s3://jupiter-backups/mongodb/

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -type f -mtime +7 -delete
```

### 2. Restore Procedures
```bash
#!/bin/bash
# scripts/restore_db.sh

# Configuration
BACKUP_DIR="/var/backups/mongodb"
MONGODB_URI="mongodb://localhost:27017/jupiter"

# Download from S3 if backup date provided
if [ ! -z "$1" ]; then
  aws s3 cp s3://jupiter-backups/mongodb/$1.tar.gz $BACKUP_DIR/
  tar -xzf $BACKUP_DIR/$1.tar.gz -C $BACKUP_DIR
  RESTORE_DIR="$BACKUP_DIR/$1"
else
  # Use latest local backup
  LATEST_BACKUP=$(ls -t $BACKUP_DIR/*.tar.gz | head -1)
  tar -xzf $LATEST_BACKUP -C $BACKUP_DIR
  RESTORE_DIR="${LATEST_BACKUP%.tar.gz}"
fi

# Perform restore
mongorestore --uri $MONGODB_URI $RESTORE_DIR

# Cleanup
rm -rf $RESTORE_DIR
```

### 3. Migration Scripts
```javascript
// migrations/001_add_case_priority.js
db.cases.updateMany(
  { priority: { $exists: false } },
  { $set: { priority: "medium" } }
);

db.cases.createIndex({ "priority": 1 });

// migrations/002_update_alert_schema.js
db.alerts.updateMany(
  {},
  { $rename: { "level": "severity" } }
);

// Migration runner
async function runMigration(db, migrationName) {
  const session = db.startSession();
  try {
    await session.withTransaction(async () => {
      const migration = require(`./migrations/${migrationName}`);
      await migration.up(db);
      await db.migrations.insertOne({
        name: migrationName,
        executed_at: new Date()
      });
    });
  } finally {
    session.endSession();
  }
}
```

## Performance Optimization

### 1. Query Optimization
```javascript
// Bad Query
db.cases.find({ status: "open" }).sort({ created_at: -1 });

// Optimized Query (with index)
db.cases.find({ status: "open" })
  .hint({ status: 1, created_at: -1 })
  .sort({ created_at: -1 });

// Bad Aggregate
db.alerts.aggregate([
  { $match: { resolved: false } },
  { $group: { _id: "$severity", count: { $sum: 1 } } }
]);

// Optimized Aggregate
db.alerts.aggregate([
  { $match: { resolved: false } },
  { $group: { _id: "$severity", count: { $sum: 1 } } }
], {
  allowDiskUse: true,
  hint: { resolved: 1, severity: 1 }
});
```

### 2. Indexing Strategy
```javascript
// Compound Indexes for Common Queries
db.cases.createIndex(
  { status: 1, created_at: -1 },
  { background: true }
);

// Partial Indexes for Specific Queries
db.alerts.createIndex(
  { case_id: 1 },
  { partialFilterExpression: { resolved: false } }
);

// Wildcard Indexes for Dynamic Queries
db.audit_logs.createIndex(
  { "$**": 1 },
  { wildcardProjection: { details: 1 } }
);
```

### 3. Monitoring Queries
```javascript
// Enable Profiling
db.setProfilingLevel(1, { slowms: 100 });

// Analyze Slow Queries
db.system.profile.find(
  { millis: { $gt: 100 } },
  { command: 1, millis: 1, ns: 1 }
).sort({ millis: -1 });

// Get Collection Statistics
db.cases.stats();

// Index Usage Statistics
db.cases.aggregate([
  { $indexStats: {} }
]);
```

## Data Management

### 1. Data Cleanup
```javascript
// Remove Old Data
db.audit_logs.deleteMany({
  created_at: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
});

// Archive Resolved Cases
db.cases.aggregate([
  { 
    $match: {
      status: "resolved",
      updated_at: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }
  },
  { $out: "archived_cases" }
]);

// Cleanup Orphaned Documents
db.alerts.deleteMany({
  case_id: {
    $nin: db.cases.distinct("_id")
  }
});
```

### 2. Data Validation
```javascript
db.createCollection("cases", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "status", "severity", "created_at"],
      properties: {
        title: {
          bsonType: "string",
          minLength: 1,
          maxLength: 200
        },
        status: {
          enum: ["open", "in_progress", "resolved", "closed"]
        },
        severity: {
          enum: ["low", "medium", "high", "critical"]
        },
        assignee: {
          bsonType: ["objectId", "null"]
        }
      }
    }
  }
});
```

### 3. Data Aggregation
```javascript
// Case Statistics
db.cases.aggregate([
  {
    $group: {
      _id: {
        status: "$status",
        severity: "$severity"
      },
      count: { $sum: 1 },
      avgResolutionTime: {
        $avg: {
          $subtract: ["$resolved_at", "$created_at"]
        }
      }
    }
  },
  {
    $sort: {
      "_id.severity": -1,
      "_id.status": 1
    }
  }
]);

// Alert Trends
db.alerts.aggregate([
  {
    $match: {
      timestamp: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    }
  },
  {
    $group: {
      _id: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        type: "$type"
      },
      count: { $sum: 1 }
    }
  },
  {
    $sort: {
      "_id.date": 1
    }
  }
]);
```

## Monitoring & Maintenance

### 1. Health Checks
```javascript
// Database Status
db.adminCommand({ serverStatus: 1 });

// Replica Set Status
rs.status();

// Collection Health
db.cases.validate({ full: true });
```

### 2. Performance Monitoring
```javascript
// Current Operations
db.currentOp({
  "active": true,
  "secs_running": { $gt: 3 }
});

// Storage Stats
db.stats();

// Index Usage
db.cases.aggregate([
  { $indexStats: {} }
]);
```

### 3. Maintenance Tasks
```javascript
// Compact Collections
db.runCommand({ compact: "cases" });

// Repair Database
db.repairDatabase();

// Update Statistics
db.cases.updateStats();
```

## Security

### 1. Access Control
```javascript
// Create Admin User
db.createUser({
  user: "admin",
  pwd: "secure_password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase"]
});

// Create Application User
db.createUser({
  user: "app_user",
  pwd: "app_password",
  roles: [
    { role: "readWrite", db: "jupiter" }
  ]
});
```

### 2. Auditing
```javascript
// Enable Auditing
db.setParameter({
  auditAuthorizationSuccess: true
});

// Query Audit Log
db.system.audit.find({
  "atype": "authCheck",
  "ts": { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
});
```

### 3. Encryption
```javascript
// Enable Encryption at Rest
db.createCollection("sensitive_data", {
  encryptedFields: {
    fields: [
      {
        path: "ssn",
        keyId: UUID("1234abcd...")
      }
    ]
  }
});
```
