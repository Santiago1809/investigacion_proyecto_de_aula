-- ENUMS PARA DEFINIR LOS TIPOS DE LAS COLUMNAS DE ESTADO EN LA BASE DE DATOS


CREATE TYPE user_status AS ENUM (
  'ACTIVE',
  'INACTIVE'
);

CREATE TYPE role_name AS ENUM (
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
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

CREATE INDEX idx_audit_requestcreate_status_history()
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

CREATE OR REPLACE FUNCTION user_has_role(
    p_user_id UUID,
    p_role role_name
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN

    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        INNER JOIN roles r
            ON r.id = ur.role_id
        WHERE ur.user_id = p_user_id
          AND r.name = p_role
    );

END;
$$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    NEW.updated_at = NOW();

    RETURN NEW;

END;
$$;


CREATE TRIGGER trg_requests_updated_at
BEFORE UPDATE ON requests
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION create_status_history(
    p_request_id UUID,
    p_new_status request_status,
    p_changed_by UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_previous_status request_status;
BEGIN

    SELECT status
    INTO v_previous_status
    FROM requests
    WHERE id = p_request_id
    FOR UPDATE;


    IF NOT FOUND THEN

        RAISE EXCEPTION
            'La solicitud % no existe',
            p_request_id;

    END IF;


    IF v_previous_status = p_new_status THEN

        RAISE EXCEPTION
            'La solicitud % ya tiene el estado %',
            p_request_id,
            p_new_status;

    END IF;


    INSERT INTO request_status_history (
        request_id,
        previous_status,
        new_status,
        changed_by
    )
    VALUES (
        p_request_id,
        v_previous_status,
        p_new_status,
        p_changed_by
    );

END;
$$;

CREATE OR REPLACE FUNCTION validate_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    -- Si el estado no cambió, no hacemos nada.

    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;


    -- NUEVO -> ASIGNADO

    IF OLD.status = 'NUEVO'
       AND NEW.status = 'ASIGNADO' THEN

        RETURN NEW;

    END IF;


    -- ASIGNADO -> EN_PROGRESO

    IF OLD.status = 'ASIGNADO'
       AND NEW.status = 'EN_PROGRESO' THEN

        RETURN NEW;

    END IF;


    -- EN_PROGRESO -> RESUELTO

    IF OLD.status = 'EN_PROGRESO'
       AND NEW.status = 'RESUELTO' THEN

        RETURN NEW;

    END IF;


    -- RESUELTO -> CERRADO

    IF OLD.status = 'RESUELTO'
       AND NEW.status = 'CERRADO' THEN

        RETURN NEW;

    END IF;


    -- RESUELTO -> EN_PROGRESO
    -- Reapertura

    IF OLD.status = 'RESUELTO'
       AND NEW.status = 'EN_PROGRESO' THEN

        RETURN NEW;

    END IF;


    RAISE EXCEPTION
        'Transición de estado no permitida: % -> %',
        OLD.status,
        NEW.status;

END;
$$;


CREATE TRIGGER trg_validate_status_transition
BEFORE UPDATE OF status ON requests
FOR EACH ROW
EXECUTE FUNCTION validate_status_transition();

CREATE OR REPLACE FUNCTION manage_request_dates()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    -- --------------------------------------------------------
    -- Se resolvió la solicitud
    -- --------------------------------------------------------

    IF NEW.status = 'RESUELTO'
       AND OLD.status <> 'RESUELTO' THEN

        NEW.resolved_at = NOW();

    END IF;


    -- --------------------------------------------------------
    -- Se cerró la solicitud
    -- --------------------------------------------------------

    IF NEW.status = 'CERRADO'
       AND OLD.status <> 'CERRADO' THEN

        NEW.closed_at = NOW();

    END IF;


    -- --------------------------------------------------------
    -- Se reabre una solicitud
    -- --------------------------------------------------------

    IF OLD.status = 'CERRADO'
       AND NEW.status = 'EN_PROGRESO' THEN

        NEW.closed_at = NULL;

    END IF;


    RETURN NEW;

END;
$$;


CREATE TRIGGER trg_manage_request_dates
BEFORE UPDATE OF status ON requests
FOR EACH ROW
EXECUTE FUNCTION manage_request_dates();

CREATE OR REPLACE FUNCTION audit_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_actor UUID;
BEGIN

    v_actor := NULLIF(
        current_setting(
            'app.current_user_id',
            true
        ),
        ''
    )::UUID;


    IF v_actor IS NULL THEN

        RAISE EXCEPTION
            'No se estableció app.current_user_id';

    END IF;


    INSERT INTO audit_events (
        request_id,
        actor_id,
        action,
        field_name,
        old_value,
        new_value
    )
    VALUES (
        NEW.id,
        v_actor,
        'STATUS_CHANGED',
        'status',
        OLD.status::TEXT,
        NEW.status::TEXT
    );


    RETURN NEW;

END;
$$;


CREATE TRIGGER trg_audit_status_change
AFTER UPDATE OF status ON requests
FOR EACH ROW
WHEN (
    OLD.status IS DISTINCT FROM NEW.status
)
EXECUTE FUNCTION audit_status_change();

CREATE OR REPLACE FUNCTION audit_priority_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_actor UUID;
BEGIN

    IF OLD.priority = NEW.priority THEN
        RETURN NEW;
    END IF;


    v_actor := NULLIF(
        current_setting(
            'app.current_user_id',
            true
        ),
        ''
    )::UUID;


    IF v_actor IS NULL THEN

        RAISE EXCEPTION
            'No se estableció app.current_user_id';

    END IF;


    INSERT INTO audit_events (
        request_id,
        actor_id,
        action,
        field_name,
        old_value,
        new_value
    )
    VALUES (
        NEW.id,
        v_actor,
        'PRIORITY_CHANGED',
        'priority',
        OLD.priority::TEXT,
        NEW.priority::TEXT
    );


    RETURN NEW;

END;
$$;


CREATE TRIGGER trg_audit_priority_change
AFTER UPDATE OF priority ON requests
FOR EACH ROW
WHEN (
    OLD.priority IS DISTINCT FROM NEW.priority
)
EXECUTE FUNCTION audit_priority_change();

CREATE OR REPLACE FUNCTION validate_request_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    -- --------------------------------------------------------
    -- El agente debe existir y estar activo
    -- --------------------------------------------------------

    IF NOT EXISTS (
        SELECT 1
        FROM users
        WHERE id = NEW.agent_id
          AND status = 'ACTIVE'
    ) THEN

        RAISE EXCEPTION
            'El usuario % no está activo',
            NEW.agent_id;

    END IF;


    -- --------------------------------------------------------
    -- El usuario debe tener rol AGENTE
    -- --------------------------------------------------------

    IF NOT user_has_role(
        NEW.agent_id,
        'AGENTE'
    ) THEN

        RAISE EXCEPTION
            'El usuario % no tiene rol de AGENTE',
            NEW.agent_id;

    END IF;


    -- --------------------------------------------------------
    -- Quien asigna debe ser COORDINADOR
    -- --------------------------------------------------------

    IF NOT user_has_role(
        NEW.assigned_by,
        'COORDINADOR'
    ) THEN

        RAISE EXCEPTION
            'Solo un COORDINADOR puede asignar solicitudes';

    END IF;


    RETURN NEW;

END;
$$;


CREATE TRIGGER trg_validate_assignment
BEFORE INSERT ON request_assignments
FOR EACH ROW
EXECUTE FUNCTION validate_request_assignment();

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_request_assignment
ON request_assignments(request_id)
WHERE unassigned_at IS NULL;

CREATE OR REPLACE FUNCTION audit_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    -- --------------------------------------------------------
    -- Auditoría
    -- --------------------------------------------------------

    INSERT INTO audit_events (
        request_id,
        actor_id,
        action,
        field_name,
        old_value,
        new_value
    )
    VALUES (
        NEW.request_id,
        NEW.assigned_by,
        'ASSIGNED',
        'agent_id',
        NULL,
        NEW.agent_id::TEXT
    );


    -- --------------------------------------------------------
    -- Notificación al agente
    -- --------------------------------------------------------

    INSERT INTO notifications (
        user_id,
        request_id,
        type,
        message
    )
    VALUES (
        NEW.agent_id,
        NEW.request_id,
        'REQUEST_ASSIGNED',
        'Se te ha asignado una nueva solicitud de soporte.'
    );


    RETURN NEW;

END;
$$;


CREATE TRIGGER trg_assignment_effects
AFTER INSERT ON request_assignments
FOR EACH ROW
EXECUTE FUNCTION audit_assignment();

CREATE OR REPLACE FUNCTION audit_unassignment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_actor UUID;
BEGIN

    -- Si no se está desasignando, no hacemos nada.

    IF OLD.unassigned_at IS NOT NULL
       OR NEW.unassigned_at IS NULL THEN

        RETURN NEW;

    END IF;


    v_actor := NULLIF(
        current_setting(
            'app.current_user_id',
            true
        ),
        ''
    )::UUID;


    IF v_actor IS NULL THEN

        RAISE EXCEPTION
            'No se estableció app.current_user_id';

    END IF;


    INSERT INTO audit_events (
        request_id,
        actor_id,
        action,
        field_name,
        old_value,
        new_value
    )
    VALUES (
        NEW.request_id,
        v_actor,
        'UNASSIGNED',
        'agent_id',
        NEW.agent_id::TEXT,
        NULL
    );


    RETURN NEW;

END;
$$;


CREATE TRIGGER trg_assignment_unassignment
AFTER UPDATE OF unassigned_at
ON request_assignments
FOR EACH ROW
EXECUTE FUNCTION audit_unassignment();

CREATE OR REPLACE FUNCTION audit_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    INSERT INTO audit_events (
        request_id,
        actor_id,
        action,
        field_name,
        old_value,
        new_value
    )
    VALUES (
        NEW.request_id,
        NEW.author_id,
        'COMMENT_CREATED',
        NULL,
        NULL,
        'Comentario creado'
    );


    RETURN NEW;

END;
$$;


CREATE TRIGGER trg_comment_audit
AFTER INSERT ON request_comments
FOR EACH ROW
EXECUTE FUNCTION audit_comment();

CREATE OR REPLACE FUNCTION prevent_comment_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    RAISE EXCEPTION
        'Los comentarios no pueden modificarse ni eliminarse';

END;
$$;


CREATE TRIGGER trg_prevent_comment_update
BEFORE UPDATE ON request_comments
FOR EACH ROW
EXECUTE FUNCTION prevent_comment_modification();


CREATE TRIGGER trg_prevent_comment_delete
BEFORE DELETE ON request_comments
FOR EACH ROW
EXECUTE FUNCTION prevent_comment_modification();

CREATE OR REPLACE FUNCTION notify_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_agent UUID;
BEGIN

    -- --------------------------------------------------------
    -- Buscar agente actualmente asignado
    -- --------------------------------------------------------

    SELECT agent_id
    INTO v_agent
    FROM request_assignments
    WHERE request_id = NEW.id
      AND unassigned_at IS NULL
    LIMIT 1;


    -- --------------------------------------------------------
    -- Notificar al agente
    -- --------------------------------------------------------

    IF v_agent IS NOT NULL THEN

        INSERT INTO notifications (
            user_id,
            request_id,
            type,
            message
        )
        VALUES (
            v_agent,
            NEW.id,

            CASE
                WHEN NEW.status = 'RESUELTO'
                    THEN 'REQUEST_RESOLVED'::notification_type

                ELSE
                    'REQUEST_STATUS_CHANGED'::notification_type
            END,

            'La solicitud cambió de estado a '
                || NEW.status::TEXT
        );

    END IF;


    -- --------------------------------------------------------
    -- Notificar al solicitante cuando se resuelve
    -- --------------------------------------------------------

    IF NEW.status = 'RESUELTO'
       AND OLD.status <> 'RESUELTO' THEN

        INSERT INTO notifications (
            user_id,
            request_id,
            type,
            message
        )
        VALUES (
            NEW.requester_id,
            NEW.id,
            'REQUEST_RESOLVED',
            'Tu solicitud ha sido marcada como resuelta.'
        );

    END IF;


    -- --------------------------------------------------------
    -- Notificar reapertura
    -- --------------------------------------------------------

    IF OLD.status = 'CERRADO'
       AND NEW.status = 'EN_PROGRESO' THEN

        INSERT INTO notifications (
            user_id,
            request_id,
            type,
            message
        )
        VALUES (
            NEW.requester_id,
            NEW.id,
            'REQUEST_REOPENED',
            'Tu solicitud ha sido reabierta.'
        );

    END IF;


    RETURN NEW;

END;
$$;


CREATE TRIGGER trg_status_notifications
AFTER UPDATE OF status ON requests
FOR EACH ROW
WHEN (
    OLD.status IS DISTINCT FROM NEW.status
)
EXECUTE FUNCTION notify_status_change();

CREATE OR REPLACE FUNCTION audit_request_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    INSERT INTO audit_events (
        request_id,
        actor_id,
        action,
        field_name,
        old_value,
        new_value
    )
    VALUES (
        NEW.id,
        NEW.requester_id,
        'REQUEST_CREATED',
        NULL,
        NULL,
        'Solicitud creada'
    );


    RETURN NEW;

END;
$$;


CREATE TRIGGER trg_request_creation_audit
AFTER INSERT ON requests
FOR EACH ROW
EXECUTE FUNCTION audit_request_creation();

CREATE OR REPLACE FUNCTION audit_report_export()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    INSERT INTO audit_events (
        request_id,
        actor_id,
        action,
        field_name,
        old_value,
        new_value
    )
    VALUES (
        NULL,
        NEW.requested_by,
        'REPORT_EXPORTED',
        NULL,
        NULL,
        NEW.filters::TEXT
    );


    RETURN NEW;

END;
$$;


CREATE TRIGGER trg_report_export_audit
AFTER INSERT ON report_exports
FOR EACH ROW
EXECUTE FUNCTION audit_report_export();
