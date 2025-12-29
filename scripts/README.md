# Database Scripts

## ⚠️ WARNING
These scripts will **DELETE ALL DATA** from your database. Use with extreme caution!

## Clear Database Script

### Option 1: Using npm script (Recommended)
```bash
npm run db:clear
```

This will:
- Connect to your database
- Truncate all tables (delete all data)
- Preserve the database schema
- Maintain table relationships

### Option 2: Using SQL directly
```bash
# Connect to your database and run the SQL file
psql $DATABASE_URL -f scripts/reset-database.sql
```

## When to use these scripts

1. **Development/Testing**: When you want to start fresh with an empty database
2. **Production Reset**: When migrating to a new version or clearing test data from production

## Safety Checklist

Before running these scripts in production:
- [ ] Backup your database
- [ ] Confirm you're connected to the correct database
- [ ] Verify with your team
- [ ] Consider the impact on users

## What gets cleared

All tables will be cleared:
- Users and authentication data
- Templates and categories
- Resumes
- Tags and variables
- Usage history
- Contacts
- All other application data

## What is preserved

- Database schema (tables, columns, indexes)
- Migrations history
- Database structure
