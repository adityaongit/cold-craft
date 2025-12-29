-- SQL script to clear all tables in the database
-- WARNING: This will delete ALL data!

-- Disable triggers temporarily
SET session_replication_role = replica;

-- Truncate all tables (preserves schema, deletes data)
TRUNCATE TABLE "User" CASCADE;
TRUNCATE TABLE "Session" CASCADE;
TRUNCATE TABLE "Account" CASCADE;
TRUNCATE TABLE "Verification" CASCADE;
TRUNCATE TABLE "Category" CASCADE;
TRUNCATE TABLE "Template" CASCADE;
TRUNCATE TABLE "Tag" CASCADE;
TRUNCATE TABLE "Variable" CASCADE;
TRUNCATE TABLE "GlobalVariable" CASCADE;
TRUNCATE TABLE "Resume" CASCADE;
TRUNCATE TABLE "ResumeVersion" CASCADE;
TRUNCATE TABLE "UsageHistory" CASCADE;
TRUNCATE TABLE "Contact" CASCADE;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Optionally reset sequences (auto-increment IDs)
-- Note: Since you're using cuid(), this may not be necessary
