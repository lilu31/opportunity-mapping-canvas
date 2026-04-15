-- Phase 2: Database Schema for Opportunity Mapping Canvas

-- 1. Create native enum for node types as requested in PRD
CREATE TYPE public.node_type AS ENUM ('CUSTOMER_OPPORTUNITY', 'BUSINESS_OPPORTUNITY', 'SUCCESS_METRIC', 'OUTCOME');

-- 2. Create users table (extends Supabase Auth)
CREATE TABLE public.users (
    id uuid primary key references auth.users not null,
    email text not null,
    name text,
    avatar_url text
);

-- 3. Create boards table
CREATE TABLE public.boards (
    id uuid primary key default gen_random_uuid(),
    title text default 'Untitled Board',
    owner_id uuid references public.users(id) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create nodes table (polymorphic canvas objects)
CREATE TABLE public.nodes (
    id uuid primary key default gen_random_uuid(),
    board_id uuid references public.boards(id) on delete cascade not null,
    type public.node_type not null,
    position_x float not null,
    position_y float not null,
    data jsonb default '{}'::jsonb,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create edges table (tree structure connections)
CREATE TABLE public.edges (
    id uuid primary key default gen_random_uuid(),
    board_id uuid references public.boards(id) on delete cascade not null,
    source uuid references public.nodes(id) on delete cascade not null,
    target uuid references public.nodes(id) on delete cascade not null
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edges ENABLE ROW LEVEL SECURITY;

-- Basic Policies (can be expanded for multi-user collaboration later)
CREATE POLICY "Public profiles are readable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- Boards Policies (for now, allow owner to do everything, read/write)
-- Note: A more robust shared policy will be needed when we implement team shares
CREATE POLICY "Users can manage their own boards." ON public.boards FOR ALL USING (auth.uid() = owner_id);

-- Nodes Policies
CREATE POLICY "Users can manage nodes on boards they own." ON public.nodes FOR ALL USING (
    board_id IN (SELECT id FROM public.boards WHERE owner_id = auth.uid())
);

-- Edges Policies
CREATE POLICY "Users can manage edges on boards they own." ON public.edges FOR ALL USING (
    board_id IN (SELECT id FROM public.boards WHERE owner_id = auth.uid())
);

-- Trigger to create a board when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar_url)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger to update 'updated_at' column on nodes
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_nodes_modtime
    BEFORE UPDATE ON public.nodes
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
