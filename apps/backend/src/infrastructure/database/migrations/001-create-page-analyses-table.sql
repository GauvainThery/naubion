-- Migration: Create page_analyses table
-- This migration creates the initial table structure for storing page analysis results

CREATE TABLE IF NOT EXISTS page_analyses (
    -- Primary key
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- URL and caching fields
    url VARCHAR(2048) NOT NULL,
    options_hash VARCHAR(64) NOT NULL,
    
    -- Timestamps
    analysis_timestamp TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Analysis results
    duration INTEGER NOT NULL,
    g_co2e DECIMAL(10,4) NOT NULL,
    
    -- JSON data fields
    options JSONB NOT NULL,
    resources JSONB NOT NULL,
    green_hosting JSONB NOT NULL,
    human_readable_impact JSONB NOT NULL,
    metadata JSONB
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_page_analyses_url_options_hash ON page_analyses(url, options_hash);
CREATE INDEX IF NOT EXISTS idx_page_analyses_url ON page_analyses(url);
CREATE INDEX IF NOT EXISTS idx_page_analyses_created_at ON page_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_page_analyses_expires_at ON page_analyses(expires_at);

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_page_analyses_updated_at 
    BEFORE UPDATE ON page_analyses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
