-- ENUMS PARA DEFINIR LOS TIPOS DE LAS COLUMNAS DE ESTADO EN LA BASE DE DATOS


CREATE TYPE user_status AS ENUM (
  'ACTIVE',
  'INACTIVE'
);

CREATE CREATE TYPE role_name as ENUM (
  'SOLICITANTE',
  'AGENTE',
  'COORDINADOR',
  'AUDITOR'
);

CREATE TYPE request_priority AS ENUM (
  'BAJA',
  'MEDIA',
  'ALTA',
  'CRITICA'
);

CREATE TYPE request_status AS ENUM (
    'NUEVO',
    'ASIGNADO',
    'EN_PROGRESO',
    'RESUELTO',
    'CERRADO'
);

CREATE TYPE audit_action AS ENUM (
    'REQUEST_CREATED',
    'PRIORITY_CHANGED',
    'ASSIGNED',
    'UNASSIGNED',
    'STATUS_CHANGED',
    'COMMENT_CREATED',
    'SOLUTION_CONFIRMED',
    'REQUEST_REOPENED',
    'REPORT_EXPORTED'
);

CREATE TYPE notification_type AS ENUM (
    'REQUEST_ASSIGNED',
    'REQUEST_STATUS_CHANGED',
    'REQUEST_REOPENED',
    'REQUEST_RESOLVED'
);

-- TABLAS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(200) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  status user_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
    id SMALLSERIAL PRIMARY KEY,

    name role_name NOT NULL UNIQUE
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL,

    role_id SMALLINT NOT NULL,

    PRIMARY KEY (user_id, role_id),

    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE RESTRICT
);

CREATE TABLE categories (
    id SMALLSERIAL PRIMARY KEY,

    name VARCHAR(80) NOT NULL UNIQUE,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(200) NOT NULL,

    description TEXT NOT NULL,

    category_id SMALLINT NOT NULL,

    priority request_priority NOT NULL DEFAULT 'MEDIA',

    status request_status NOT NULL DEFAULT 'NUEVO',

    requester_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    resolved_at TIMESTAMPTZ,

    closed_at TIMESTAMPTZ,

    CONSTRAINT fk_requests_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_requests_requester
        FOREIGN KEY (requester_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_request_title_not_empty
        CHECK (length(trim(title)) > 0),

    CONSTRAINT chk_request_description_not_empty
        CHECK (length(trim(description)) > 0),

    CONSTRAINT chk_resolved_date
        CHECK (
            resolved_at IS NULL
            OR resolved_at >= created_at
        ),

    CONSTRAINT chk_closed_date
        CHECK (
            closed_at IS NULL
            OR closed_at >= created_at
        )
);

CREATE TABLE request_assignments (
    id BIGSERIAL PRIMARY KEY,

    request_id UUID NOT NULL,

    agent_id UUID NOT NULL,

    assigned_by UUID NOT NULL,

    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    unassigned_at TIMESTAMPTZ,

    CONSTRAINT fk_assignment_request
        FOREIGN KEY (request_id)
        REFERENCES requests(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_assignment_agent
        FOREIGN KEY (agent_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_assignment_assigned_by
        FOREIGN KEY (assigned_by)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_assignment_dates
        CHECK (
            unassigned_at IS NULL
            OR unassigned_at >= assigned_at
        )
);

CREATE TABLE request_comments (
    id BIGSERIAL PRIMARY KEY,

    request_id UUID NOT NULL,

    author_id UUID NOT NULL,

    content TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_comment_request
        FOREIGN KEY (request_id)
        REFERENCES requests(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comment_author
        FOREIGN KEY (author_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_comment_not_empty
        CHECK (length(trim(content)) > 0)
);

CREATE TABLE request_status_history (
    id BIGSERIAL PRIMARY KEY,

    request_id UUID NOT NULL,

    previous_status request_status,

    new_status request_status NOT NULL,

    changed_by UUID NOT NULL,

    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_status_history_request
        FOREIGN KEY (request_id)
        REFERENCES requests(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_status_history_user
        FOREIGN KEY (changed_by)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_status_change
        CHECK (
            previous_status IS NULL
            OR previous_status <> new_status
        )
);

CREATE TABLE audit_events (
    id BIGSERIAL PRIMARY KEY,

    request_id UUID,

    actor_id UUID NOT NULL,

    action audit_action NOT NULL,

    field_name VARCHAR(80),

    old_value TEXT,

    new_value TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_audit_request
        FOREIGN KEY (request_id)
        REFERENCES requests(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_audit_actor
        FOREIGN KEY (actor_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,

    user_id UUID NOT NULL,

    request_id UUID,

    type notification_type NOT NULL,

    message TEXT NOT NULL,

    read_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notification_request
        FOREIGN KEY (request_id)
        REFERENCES requests(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_notification_message
        CHECK (length(trim(message)) > 0)
);

CREATE TABLE report_exports (
    id BIGSERIAL PRIMARY KEY,

    requested_by UUID NOT NULL,

    filters JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_report_export_user
        FOREIGN KEY (requested_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
);

-- INIDICES
CREATE INDEX idx_users_status
    ON users(status);

CREATE INDEX idx_user_roles_role
    ON user_roles(role_id);

CREATE INDEX idx_categories_active
    ON categories(active);

CREATE INDEX idx_requests_requester
    ON requests(requester_id);

CREATE INDEX idx_requests_category
    ON requests(category_id);

CREATE INDEX idx_requests_status
    ON requests(status);

CREATE INDEX idx_requests_priority
    ON requests(priority);

CREATE INDEX idx_requests_created_at
    ON requests(created_at);

CREATE INDEX idx_requests_updated_at
    ON requests(updated_at);

CREATE INDEX idx_requests_title
    ON requests(title);

CREATE INDEX idx_requests_description
    ON requests(description);

CREATE INDEX idx_assignments_request
    ON request_assignments(request_id);

CREATE INDEX idx_assignments_agent
    ON request_assignments(agent_id);

CREATE INDEX idx_assignments_active
    ON request_assignments(request_id)
    WHERE unassigned_at IS NULL;

CREATE INDEX idx_comments_request
    ON request_comments(request_id);

CREATE INDEX idx_comments_author
    ON request_comments(author_id);

CREATE INDEX idx_status_history_request
    ON request_status_history(request_id);

CREATE INDEX idx_status_history_changed_at
    ON request_status_history(changed_at);

CREATE INDEX idx_audit_request
    ON audit_events(request_id);

CREATE INDEX idx_audit_actor
    ON audit_events(actor_id);

CREATE INDEX idx_audit_created_at
    ON audit_events(created_at);

CREATE INDEX idx_notifications_user
    ON notifications(user_id);

CREATE INDEX idx_notifications_unread
    ON notifications(user_id)
    WHERE read_at IS NULL;

CREATE INDEX idx_report_exports_user
    ON report_exports(requested_by);

CREATE INDEX idx_report_exports_created_at
    ON report_exports(created_at);

