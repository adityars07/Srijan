-- Initialize separate databases for each microservice
-- This script runs automatically when the PostgreSQL container starts for the first time

CREATE DATABASE srijan_auth;
CREATE DATABASE srijan_products;
CREATE DATABASE srijan_orders;
CREATE DATABASE srijan_commissions;

-- Grant full access to the srijan user
GRANT ALL PRIVILEGES ON DATABASE srijan_auth TO srijan;
GRANT ALL PRIVILEGES ON DATABASE srijan_products TO srijan;
GRANT ALL PRIVILEGES ON DATABASE srijan_orders TO srijan;
GRANT ALL PRIVILEGES ON DATABASE srijan_commissions TO srijan;
