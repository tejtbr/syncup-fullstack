-- SyncUp Phase 1 Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    avatar_url VARCHAR(500),
    role VARCHAR(50) DEFAULT 'EMPLOYEE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Office locations
CREATE TABLE IF NOT EXISTS office_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team members
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'MEMBER',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

-- Daily status (one per user per day)
CREATE TABLE IF NOT EXISTS user_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('IN_OFFICE', 'REMOTE', 'ON_LEAVE', 'UNDECIDED')),
    status_date DATE NOT NULL,
    office_location_id UUID REFERENCES office_locations(id),
    note VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, status_date)
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_user_statuses_date ON user_statuses(status_date);
CREATE INDEX IF NOT EXISTS idx_user_statuses_user_date ON user_statuses(user_id, status_date);

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submitted_by UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'Other',
    status VARCHAR(50) DEFAULT 'OPEN',
    admin_response TEXT,
    upvote_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ideas_submitted_by ON ideas(submitted_by);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);

-- Idea upvotes table
CREATE TABLE IF NOT EXISTS idea_upvotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(idea_id, user_id)
);

-- Seed office locations
INSERT INTO office_locations (name, city, country) VALUES
    ('USA', 'Andover, Massachusetts', 'United States'),
    ('Bangalore', 'Banaglore', 'India'),
    ('Canada', 'Burlington / Ontario', 'Canada')
ON CONFLICT DO NOTHING;

-- Seed demo users (password: Password@123)
INSERT INTO users (id, email, password, full_name, department, role) VALUES
    ('a0000001-0000-0000-0000-000000000001', 'alice@syncup.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RFnEpvmRZoiSmSbne', 'Alice Johnson', 'Engineering', 'ADMIN'),
    ('a0000001-0000-0000-0000-000000000002', 'bob@syncup.com',   '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RFnEpvmRZoiSmSbne', 'Bob Smith',    'Engineering', 'EMPLOYEE'),
    ('a0000001-0000-0000-0000-000000000003', 'carol@syncup.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RFnEpvmRZoiSmSbne', 'Carol White',  'Finance',      'EMPLOYEE'),
    ('a0000001-0000-0000-0000-000000000004', 'dave@syncup.com',  '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RFnEpvmRZoiSmSbne', 'Dave Brown',   'HR',           'EMPLOYEE')
ON CONFLICT DO NOTHING;
