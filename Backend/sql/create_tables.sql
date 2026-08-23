-- ============================================================
-- NovaGrid Endpoint Tree — Database Tables
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Endpoint Manifests — stores scanned endpoint data
CREATE TABLE IF NOT EXISTS endpoint_manifests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    manifest JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    total_endpoints INTEGER DEFAULT 0,
    warnings JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Endpoint Change Reports — self-reported changes needing human review
CREATE TABLE IF NOT EXISTS endpoint_change_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    change_type TEXT NOT NULL,
    severity TEXT DEFAULT 'low',
    method TEXT DEFAULT '',
    path TEXT DEFAULT '',
    file TEXT DEFAULT '',
    detail TEXT DEFAULT '',
    change_data JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending',
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_manifests_created ON endpoint_manifests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON endpoint_change_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created ON endpoint_change_reports(created_at DESC);

-- 3. Tracked Public APIs
CREATE TABLE IF NOT EXISTS tracked_apis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    base_url TEXT DEFAULT '',
    openapi_url TEXT DEFAULT '',
    spec JSONB DEFAULT '{}'::jsonb,
    parsed JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'active',
    last_checked TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Public API Change History
CREATE TABLE IF NOT EXISTS public_api_changes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    api_id UUID REFERENCES tracked_apis(id) ON DELETE CASCADE,
    api_name TEXT DEFAULT '',
    change_type TEXT NOT NULL,
    method TEXT DEFAULT '',
    path TEXT DEFAULT '',
    detail TEXT DEFAULT '',
    severity TEXT DEFAULT 'low',
    status TEXT DEFAULT 'detected',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracked_apis_name ON tracked_apis(name);
CREATE INDEX IF NOT EXISTS idx_public_changes_api ON public_api_changes(api_id);
CREATE INDEX IF NOT EXISTS idx_public_changes_created ON public_api_changes(created_at DESC);


