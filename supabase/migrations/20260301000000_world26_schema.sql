-- =====================================================================
-- WORLD//26 Planetary Systems Simulator: Multi-Tenant Schema & RLS
-- Migration: 20260301000000_world26_schema.sql
-- =====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    organization TEXT,
    role TEXT DEFAULT 'researcher',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Multi-Tenant Workspaces
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'open_source_research',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Workspace Memberships
CREATE TABLE IF NOT EXISTS public.workspace_members (
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (workspace_id, user_id)
);

-- 5. Versioned Model Releases
CREATE TABLE IF NOT EXISTS public.model_releases (
    id TEXT PRIMARY KEY,
    version TEXT NOT NULL,
    release_date DATE NOT NULL,
    git_sha TEXT,
    checksum_sha256 TEXT NOT NULL,
    changelog TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Versioned Data Releases
CREATE TABLE IF NOT EXISTS public.data_releases (
    id TEXT PRIMARY KEY,
    version TEXT NOT NULL,
    release_date DATE NOT NULL,
    checksums_json JSONB NOT NULL,
    sources_count INT DEFAULT 16,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Scenarios
CREATE TABLE IF NOT EXISTS public.scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    family TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, slug)
);

-- 8. Scenario Immutable Version History
CREATE TABLE IF NOT EXISTS public.scenario_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    base_scenario_id TEXT,
    parameter_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
    policy_interventions JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(scenario_id, version_number)
);

-- 9. Simulation Runs
CREATE TABLE IF NOT EXISTS public.runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID REFERENCES public.scenarios(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    engine_type TEXT NOT NULL DEFAULT 'ts_reference', -- 'rust_native', 'wasm', 'ts_reference'
    solver_algorithm TEXT NOT NULL DEFAULT 'rk4',
    dt NUMERIC(6,4) DEFAULT 0.2500,
    start_year NUMERIC(6,2) DEFAULT 1900.0,
    end_year NUMERIC(6,2) DEFAULT 2100.0,
    execution_duration_ms INT,
    peak_population_val NUMERIC,
    peak_population_year NUMERIC,
    warming_2100_val NUMERIC,
    co2_2100_val NUMERIC,
    wellbeing_2100_val NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Run Time-Series & Artifacts
CREATE TABLE IF NOT EXISTS public.run_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES public.runs(id) ON DELETE CASCADE,
    series_json JSONB NOT NULL,
    milestones_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    boundary_values_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Public Cryptographic Share Links
CREATE TABLE IF NOT EXISTS public.shared_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
    target_type TEXT NOT NULL CHECK (target_type IN ('run', 'scenario')),
    target_id UUID NOT NULL,
    expires_at TIMESTAMPTZ,
    view_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.run_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_links ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Public Releases (Open Access)
CREATE POLICY "Public can view model releases" ON public.model_releases
    FOR SELECT USING (true);

CREATE POLICY "Public can view data releases" ON public.data_releases
    FOR SELECT USING (true);

-- Workspaces Policies
CREATE POLICY "Members can view workspaces" ON public.workspaces
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_id = workspaces.id AND user_id = auth.uid()
        )
    );

-- Workspace Members Policies
CREATE POLICY "Members can view workspace members" ON public.workspace_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members m
            WHERE m.workspace_id = workspace_members.workspace_id AND m.user_id = auth.uid()
        )
    );

-- Scenarios Policies
CREATE POLICY "View public or workspace scenarios" ON public.scenarios
    FOR SELECT USING (
        is_public = true OR
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_id = scenarios.workspace_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can insert scenarios" ON public.scenarios
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_id = scenarios.workspace_id 
              AND user_id = auth.uid() 
              AND role IN ('owner', 'editor')
        )
    );

CREATE POLICY "Workspace editors can update scenarios" ON public.scenarios
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_id = scenarios.workspace_id 
              AND user_id = auth.uid() 
              AND role IN ('owner', 'editor')
        )
    );

-- Scenario Versions Policies
CREATE POLICY "View versions of visible scenarios" ON public.scenario_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.scenarios s
            WHERE s.id = scenario_versions.scenario_id AND (
                s.is_public = true OR
                EXISTS (
                    SELECT 1 FROM public.workspace_members m
                    WHERE m.workspace_id = s.workspace_id AND m.user_id = auth.uid()
                )
            )
        )
    );

-- Runs & Artifacts Policies
CREATE POLICY "View own runs or shared runs" ON public.runs
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.shared_links sl
            WHERE sl.target_type = 'run' AND sl.target_id = runs.id AND (sl.expires_at IS NULL OR sl.expires_at > NOW())
        )
    );

CREATE POLICY "Insert own runs" ON public.runs
    FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.uid() IS NULL);

CREATE POLICY "View run artifacts for visible runs" ON public.run_artifacts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.runs r
            WHERE r.id = run_artifacts.run_id AND (
                r.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.shared_links sl
                    WHERE sl.target_type = 'run' AND sl.target_id = r.id AND (sl.expires_at IS NULL OR sl.expires_at > NOW())
                )
            )
        )
    );

CREATE POLICY "Insert run artifacts" ON public.run_artifacts
    FOR INSERT WITH CHECK (true);

-- Shared Links Policies
CREATE POLICY "Public token lookup for shared links" ON public.shared_links
    FOR SELECT USING (true);

CREATE POLICY "Users can create share links" ON public.shared_links
    FOR INSERT WITH CHECK (true);
