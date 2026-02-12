-- Drop production tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS production_batch_items CASCADE;
DROP TABLE IF EXISTS production_batches CASCADE;
DROP TABLE IF EXISTS production_formula_items CASCADE;
DROP TABLE IF EXISTS production_formulas CASCADE;
DROP TABLE IF EXISTS production_lines CASCADE;

-- Recreate production_lines
CREATE TABLE production_lines (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    factory_id INTEGER NOT NULL REFERENCES factories(id) ON DELETE RESTRICT,
    machine_id INTEGER REFERENCES machines(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by INTEGER REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES profiles(id) ON DELETE SET NULL
);
CREATE INDEX idx_production_lines_workspace ON production_lines(workspace_id);
CREATE INDEX idx_production_lines_factory ON production_lines(factory_id);

-- Recreate production_formulas (WITHOUT output_item_id and output_quantity)
CREATE TABLE production_formulas (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    formula_code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    estimated_duration_minutes INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_by INTEGER REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_production_formulas_workspace ON production_formulas(workspace_id);
CREATE INDEX idx_production_formulas_code ON production_formulas(formula_code);

-- Recreate production_formula_items
CREATE TABLE production_formula_items (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    formula_id INTEGER NOT NULL REFERENCES production_formulas(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    item_role VARCHAR(20) NOT NULL CHECK (item_role IN ('input', 'output', 'waste', 'byproduct')),
    quantity INTEGER NOT NULL,
    unit VARCHAR(20),
    is_optional BOOLEAN NOT NULL DEFAULT FALSE,
    tolerance_percentage NUMERIC(5,2)
);
CREATE INDEX idx_production_formula_items_workspace ON production_formula_items(workspace_id);
CREATE INDEX idx_production_formula_items_formula ON production_formula_items(formula_id);
CREATE INDEX idx_production_formula_items_role ON production_formula_items(item_role);

-- Recreate production_batches
CREATE TABLE production_batches (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    batch_number VARCHAR(50) NOT NULL,
    production_line_id INTEGER NOT NULL REFERENCES production_lines(id) ON DELETE RESTRICT,
    formula_id INTEGER REFERENCES production_formulas(id) ON DELETE SET NULL,
    batch_date DATE NOT NULL,
    shift VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled')),
    expected_output_quantity INTEGER,
    expected_duration_minutes INTEGER,
    actual_output_quantity INTEGER,
    actual_duration_minutes INTEGER,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    output_variance_quantity INTEGER,
    output_variance_percentage NUMERIC(5,2),
    efficiency_percentage NUMERIC(5,2),
    notes TEXT,
    created_by INTEGER REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    started_by INTEGER REFERENCES profiles(id) ON DELETE SET NULL,
    started_at TIMESTAMP,
    completed_by INTEGER REFERENCES profiles(id) ON DELETE SET NULL,
    completed_at TIMESTAMP
);
CREATE INDEX idx_production_batches_workspace ON production_batches(workspace_id);
CREATE INDEX idx_production_batches_line ON production_batches(production_line_id);
CREATE INDEX idx_production_batches_status ON production_batches(status);

-- Recreate production_batch_items
CREATE TABLE production_batch_items (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    batch_id INTEGER NOT NULL REFERENCES production_batches(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    item_role VARCHAR(20) NOT NULL CHECK (item_role IN ('input', 'output', 'waste', 'byproduct')),
    expected_quantity INTEGER,
    actual_quantity INTEGER,
    source_location_type VARCHAR(50),
    source_location_id INTEGER,
    destination_location_type VARCHAR(50),
    destination_location_id INTEGER,
    variance_quantity INTEGER,
    variance_percentage NUMERIC(5,2),
    notes TEXT
);
CREATE INDEX idx_production_batch_items_workspace ON production_batch_items(workspace_id);
CREATE INDEX idx_production_batch_items_batch ON production_batch_items(batch_id);
CREATE INDEX idx_production_batch_items_role ON production_batch_items(item_role);
