import type {
  AdminEvent,
  AdminForm,
  Catalog,
  CatalogItem,
  DbUserWithPassword,
  EventSummary,
  FormField,
  FormSection,
  FormTemplate,
  LocationOption,
  OpenSession,
  Participant,
  SessionUser
} from "./types";

function canSeeAllEvents(user: SessionUser) {
  return user.roles.includes("administrador");
}

export async function getEventBySlug(db: D1Database, slug: string) {
  return db
    .prepare(
      `SELECT id, title, source_title, start_date, end_date, start_time, end_time, status, short_link_slug
       FROM events
       WHERE short_link_slug = ?`
    )
    .bind(slug)
    .first<EventSummary>();
}

export async function getActiveFormBySlug(db: D1Database, slug: string) {
  return db
    .prepare(
      `SELECT id, event_id, name, status, short_link_slug, welcome_title_template
       FROM forms
       WHERE short_link_slug = ? AND status = 'active'
       LIMIT 1`
    )
    .bind(slug)
    .first<{ id: string; event_id: string; name: string; status: string; short_link_slug: string; welcome_title_template: string }>();
}

export async function getPublicFormContextBySlug(db: D1Database, slug: string) {
  return db
    .prepare(
      `SELECT
        f.id AS form_id,
        f.event_id,
        f.name AS form_name,
        f.status AS form_status,
        f.short_link_slug AS form_short_link_slug,
        f.form_template_id,
        f.welcome_title_template,
        e.id AS event_id,
        e.title AS event_title,
        e.source_title,
        e.start_date,
        e.end_date,
        e.start_time,
        e.end_time,
        e.status AS event_status,
        e.short_link_slug AS event_short_link_slug
       FROM forms f
       INNER JOIN events e ON e.id = f.event_id
       WHERE f.short_link_slug = ? AND f.status = 'active'
       LIMIT 1`
    )
    .bind(slug)
    .first<{
      form_id: string;
      event_id: string;
      form_name: string;
      form_status: string;
      form_short_link_slug: string;
      form_template_id: string | null;
      welcome_title_template: string;
      event_title: string;
      source_title: string | null;
      start_date: string | null;
      end_date: string | null;
      start_time: string | null;
      end_time: string | null;
      event_status: string;
      event_short_link_slug: string | null;
    }>();
}

export async function getOpenSessionForEvent(db: D1Database, eventId: string) {
  return db
    .prepare(
      `SELECT
        s.id,
        s.event_id,
        s.module_id,
        m.title AS module_title,
        s.sequence,
        s.title,
        s.theme,
        s.session_date,
        s.start_time,
        s.end_time,
        s.status,
        s.attendance_status
       FROM event_sessions s
       INNER JOIN event_modules m ON m.id = s.module_id
       WHERE s.event_id = ? AND s.attendance_status = 'open'
       LIMIT 1`
    )
    .bind(eventId)
    .first<OpenSession>();
}

export async function listEventSessions(db: D1Database, eventId: string) {
  return db
    .prepare(
      `SELECT
        s.id,
        s.module_id,
        s.sequence,
        s.title,
        s.theme,
        s.session_date,
        s.start_time,
        s.end_time,
        s.status,
        s.attendance_status,
        m.title AS module_title
       FROM event_sessions s
       INNER JOIN event_modules m ON m.id = s.module_id
       WHERE s.event_id = ?
       ORDER BY s.sequence`
    )
    .bind(eventId)
    .all();
}

export async function listAdminEvents(db: D1Database, user: SessionUser) {
  const whereSql = canSeeAllEvents(user) ? "" : "WHERE e.created_by_user_id = ?";
  const statement = db.prepare(
    `SELECT
      e.id,
      e.title,
      e.source_title,
      e.theme,
      e.start_date,
      e.end_date,
      e.start_time,
      e.end_time,
      e.status,
      e.short_link_slug,
      COUNT(DISTINCT m.id) AS module_count,
      COUNT(DISTINCT s.id) AS session_count,
      COUNT(DISTINCT CASE WHEN s.attendance_status = 'open' THEN s.id END) AS open_session_count,
      af.id AS associated_form_id,
      af.name AS associated_form_name,
      ft.id AS associated_template_id,
      ft.name AS associated_template_name
     FROM events e
     LEFT JOIN event_modules m ON m.event_id = e.id
     LEFT JOIN event_sessions s ON s.event_id = e.id
     LEFT JOIN forms af ON af.event_id = e.id AND af.short_link_slug = e.short_link_slug AND af.status = 'active'
     LEFT JOIN form_templates ft ON ft.id = af.form_template_id
     ${whereSql}
     GROUP BY e.id
     ORDER BY e.created_at DESC`
  );

  return canSeeAllEvents(user) ? statement.all<AdminEvent>() : statement.bind(user.id).all<AdminEvent>();
}

export async function userCanManageEvent(db: D1Database, eventId: string, user: SessionUser) {
  if (canSeeAllEvents(user)) {
    const event = await db.prepare("SELECT id FROM events WHERE id = ?").bind(eventId).first<{ id: string }>();
    return Boolean(event);
  }

  return db
    .prepare("SELECT id FROM events WHERE id = ? AND created_by_user_id = ?")
    .bind(eventId, user.id)
    .first<{ id: string }>()
    .then(Boolean);
}

export async function listEventModules(db: D1Database, eventId: string) {
  return db
    .prepare(
      `SELECT id, title, order_index, status
       FROM event_modules
       WHERE event_id = ?
       ORDER BY order_index`
    )
    .bind(eventId)
    .all();
}

export async function getSessionById(db: D1Database, sessionId: string) {
  return db
    .prepare(
      `SELECT id, event_id, module_id, sequence, title, theme, session_date, start_time, end_time, status, attendance_status
       FROM event_sessions
       WHERE id = ?`
    )
    .bind(sessionId)
    .first<OpenSession>();
}

export async function openEventSession(db: D1Database, eventId: string, sessionId: string) {
  const existing = await getSessionById(db, sessionId);

  if (!existing || existing.event_id !== eventId) {
    return { ok: false, message: "Sesión no encontrada." };
  }

  await db.batch([
    db
      .prepare(
        `UPDATE event_sessions
         SET attendance_status = 'closed', status = 'closed', updated_at = CURRENT_TIMESTAMP
         WHERE event_id = ? AND attendance_status = 'open'`
      )
      .bind(eventId),
    db
      .prepare(
        `UPDATE event_sessions
         SET attendance_status = 'open', status = 'open', updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND event_id = ?`
      )
      .bind(sessionId, eventId)
  ]);

  return { ok: true };
}

export async function closeEventSession(db: D1Database, eventId: string, sessionId: string) {
  const result = await db
    .prepare(
      `UPDATE event_sessions
       SET attendance_status = 'closed', status = 'closed', updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND event_id = ?`
    )
    .bind(sessionId, eventId)
    .run();

  return result.meta.changes > 0;
}

export async function updateEventSessionDetails(db: D1Database, eventId: string, sessionId: string, input: {
  moduleTitle: string;
  title: string;
  theme: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: string;
}) {
  const existing = await getSessionById(db, sessionId);

  if (!existing || existing.event_id !== eventId) {
    return { ok: false, message: "Sesion no encontrada." };
  }

  const moduleTitle = input.moduleTitle.trim() || "Modulo general";
  let module = await db
    .prepare("SELECT id FROM event_modules WHERE event_id = ? AND lower(title) = lower(?) LIMIT 1")
    .bind(eventId, moduleTitle)
    .first<{ id: string }>();

  if (!module) {
    const moduleId = `mod_${crypto.randomUUID().slice(0, 8)}`;
    const order = await db
      .prepare("SELECT COALESCE(MAX(order_index), 0) + 1 AS next_order FROM event_modules WHERE event_id = ?")
      .bind(eventId)
      .first<{ next_order: number }>();

    await db
      .prepare("INSERT INTO event_modules (id, event_id, title, order_index, status) VALUES (?, ?, ?, ?, 'active')")
      .bind(moduleId, eventId, moduleTitle, order?.next_order ?? 1)
      .run();
    module = { id: moduleId };
  }

  const attendanceStatus = input.status === "open" ? "open" : "closed";
  const statements: D1PreparedStatement[] = [];

  if (attendanceStatus === "open") {
    statements.push(
      db
        .prepare(
          `UPDATE event_sessions
           SET attendance_status = 'closed', status = 'closed', updated_at = CURRENT_TIMESTAMP
           WHERE event_id = ? AND id <> ? AND attendance_status = 'open'`
        )
        .bind(eventId, sessionId)
    );
  }

  statements.push(
    db
      .prepare(
        `UPDATE event_sessions
         SET module_id = ?, title = ?, theme = ?, session_date = ?, start_time = ?, end_time = ?, status = ?, attendance_status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND event_id = ?`
      )
      .bind(
        module.id,
        input.title,
        input.theme,
        input.sessionDate,
        input.startTime,
        input.endTime,
        attendanceStatus,
        attendanceStatus,
        sessionId,
        eventId
      )
  );

  await db.batch(statements);
  return { ok: true };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

export function normalizePublicSlug(value: string) {
  return slugify(value).slice(0, 48);
}

export async function isShortLinkAvailable(db: D1Database, slug: string, eventId?: string) {
  const event = await db
    .prepare("SELECT id FROM events WHERE short_link_slug = ? AND (? IS NULL OR id <> ?) LIMIT 1")
    .bind(slug, eventId ?? null, eventId ?? null)
    .first<{ id: string }>();

  if (event) return false;

  const form = await db
    .prepare(
      `SELECT f.id
       FROM forms f
       WHERE f.short_link_slug = ?
         AND (? IS NULL OR f.event_id <> ?)
       LIMIT 1`
    )
    .bind(slug, eventId ?? null, eventId ?? null)
    .first<{ id: string }>();

  return !form;
}

export async function createEventWithSchedule(db: D1Database, user: SessionUser, input: {
  title: string;
  shortLinkSlug: string;
  theme?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  sessions: Array<{
    moduleTitle: string;
    title: string;
    theme: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
  }>;
}) {
  const suffix = crypto.randomUUID().slice(0, 8);
  const eventId = `evt_${suffix}`;
  const slug = normalizePublicSlug(input.shortLinkSlug);
  const formId = `form_${suffix}`;
  const moduleIds = new Map<string, string>();
  const statements: D1PreparedStatement[] = [
    db
      .prepare(
        `INSERT INTO events (id, title, source_title, theme, start_date, end_date, start_time, end_time, status, short_link_slug, created_by_user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)`
      )
      .bind(
        eventId,
        input.title,
        input.title,
        input.theme ?? input.title,
        input.startDate,
        input.endDate,
        input.startTime,
        input.endTime,
        slug,
        user.id
      )
  ];

  input.sessions.forEach((session, index) => {
    const moduleKey = session.moduleTitle.trim() || "Modulo general";
    if (!moduleIds.has(moduleKey)) {
      const moduleId = `mod_${suffix}_${moduleIds.size + 1}`;
      moduleIds.set(moduleKey, moduleId);
      statements.push(
        db
          .prepare(
            `INSERT INTO event_modules (id, event_id, title, order_index, status)
             VALUES (?, ?, ?, ?, 'active')`
          )
          .bind(moduleId, eventId, moduleKey, moduleIds.size)
      );
    }

    statements.push(
      db
        .prepare(
          `INSERT INTO event_sessions (id, event_id, module_id, sequence, title, theme, session_date, start_time, end_time, status, attendance_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'closed', 'closed')`
        )
        .bind(
          `ses_${suffix}_${index + 1}`,
          eventId,
          moduleIds.get(moduleKey),
          index + 1,
          session.title || `Sesión ${index + 1}`,
          session.theme || session.title || `Sesión ${index + 1}`,
          session.sessionDate,
          session.startTime,
          session.endTime
        )
    );
  });

  const templateSections = await db
    .prepare("SELECT id, section_key, title, order_index FROM form_sections WHERE form_id = 'form_inauguracion_otca' ORDER BY order_index")
    .all<FormSection>();
  const templateFields = await db
    .prepare(
      "SELECT id, section_id, field_key, label, field_type, catalog_key, is_required, order_index, config FROM form_fields WHERE form_id = 'form_inauguracion_otca' ORDER BY order_index"
    )
    .all<FormField>();

  statements.push(
    db
      .prepare(
        `INSERT INTO forms (id, event_id, name, status, short_link_slug, welcome_title_template, cloned_from_form_id)
         VALUES (?, ?, ?, 'active', ?, ?, 'form_inauguracion_otca')`
      )
      .bind(
        formId,
        eventId,
        `Formulario de asistencia - ${input.title}`,
        slug,
        "Bienvenido a {{event.title}} - {{session.title}}: {{session.theme}}"
      )
  );

  for (const section of templateSections.results) {
    const sectionId = `${section.id}_${suffix}`;
    statements.push(
      db
        .prepare("INSERT INTO form_sections (id, form_id, section_key, title, order_index) VALUES (?, ?, ?, ?, ?)")
        .bind(sectionId, formId, section.section_key, section.title, section.order_index)
    );

    for (const field of templateFields.results.filter((item) => item.section_id === section.id)) {
      statements.push(
        db
          .prepare(
            `INSERT INTO form_fields (id, form_id, section_id, field_key, label, field_type, catalog_key, is_required, order_index, config)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            `${field.id}_${suffix}`,
            formId,
            sectionId,
            field.field_key,
            field.label,
            field.field_type,
            field.catalog_key,
            field.is_required,
            field.order_index,
            field.config
          )
      );
    }
  }

  await db.batch(statements);
  return { eventId, formId, slug };
}

export async function updateEventDetails(db: D1Database, eventId: string, input: {
  title: string;
  shortLinkSlug: string;
  theme?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: string;
}) {
  const currentEvent = await db
    .prepare("SELECT short_link_slug FROM events WHERE id = ?")
    .bind(eventId)
    .first<{ short_link_slug: string }>();
  const nextSlug = normalizePublicSlug(input.shortLinkSlug);
  const result = await db
    .prepare(
      `UPDATE events
       SET title = ?, source_title = ?, theme = ?, start_date = ?, end_date = ?, start_time = ?, end_time = ?, status = ?, short_link_slug = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(
      input.title,
      input.title,
      input.theme ?? input.title,
      input.startDate,
      input.endDate,
      input.startTime,
      input.endTime,
      input.status,
      nextSlug,
      eventId
    )
    .run();

  if (currentEvent) {
    await db
      .prepare(
        `UPDATE forms
         SET short_link_slug = ?, updated_at = CURRENT_TIMESTAMP
         WHERE event_id = ? AND status = 'active' AND short_link_slug = ?`
      )
      .bind(nextSlug, eventId, currentEvent.short_link_slug)
      .run();
  }

  return result.meta.changes > 0;
}

export async function associateEventForm(db: D1Database, eventId: string, formId: string, user: SessionUser) {
  const event = await db
    .prepare("SELECT id, title, short_link_slug FROM events WHERE id = ?")
    .bind(eventId)
    .first<{ id: string; title: string; short_link_slug: string }>();
  const source = await getAdminForm(db, formId, user);

  if (!event || !source || source.status !== "active") {
    return null;
  }

  const suffix = crypto.randomUUID().slice(0, 8);
  const backupSlug = `${event.short_link_slug}-anterior-${suffix}`;
  const statements: D1PreparedStatement[] = [
    db
      .prepare(
        `UPDATE forms
         SET short_link_slug = ?, status = 'inactive', updated_at = CURRENT_TIMESTAMP
         WHERE event_id = ? AND short_link_slug = ? AND id <> ?`
      )
      .bind(backupSlug, eventId, event.short_link_slug, formId)
  ];

  let associatedFormId = formId;

  if (source.event_id === eventId) {
    statements.push(
      db
        .prepare("UPDATE forms SET short_link_slug = ?, status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(event.short_link_slug, formId)
    );
  } else {
    associatedFormId = `form_assoc_${suffix}`;
    const sections = await db
      .prepare("SELECT id, section_key, title, order_index FROM form_sections WHERE form_id = ? ORDER BY order_index")
      .bind(formId)
      .all<FormSection>();
    const fields = await db
      .prepare(
        "SELECT id, section_id, field_key, label, field_type, catalog_key, is_required, order_index, config FROM form_fields WHERE form_id = ? ORDER BY order_index"
      )
      .bind(formId)
      .all<FormField>();

    statements.push(
      db
        .prepare(
          `INSERT INTO forms (id, event_id, name, status, short_link_slug, welcome_title_template, cloned_from_form_id)
           VALUES (?, ?, ?, 'active', ?, ?, ?)`
        )
        .bind(
          associatedFormId,
          eventId,
          source.name,
          event.short_link_slug,
          source.welcome_title_template,
          source.id
        )
    );

    for (const section of sections.results) {
      const newSectionId = `${section.id}_${suffix}`;
      statements.push(
        db
          .prepare(
            `INSERT INTO form_sections (id, form_id, section_key, title, order_index)
             VALUES (?, ?, ?, ?, ?)`
          )
          .bind(newSectionId, associatedFormId, section.section_key, section.title, section.order_index)
      );

      for (const field of fields.results.filter((item) => item.section_id === section.id)) {
        statements.push(
          db
            .prepare(
              `INSERT INTO form_fields (id, form_id, section_id, field_key, label, field_type, catalog_key, is_required, order_index, config)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
            .bind(
              `${field.id}_${suffix}`,
              associatedFormId,
              newSectionId,
              field.field_key,
              field.label,
              field.field_type,
              field.catalog_key,
              field.is_required,
              field.order_index,
              field.config
            )
        );
      }
    }
  }

  await db.batch(statements);
  return getAdminForm(db, associatedFormId, user);
}

export async function associateEventFormTemplate(db: D1Database, eventId: string, templateId: string) {
  const event = await db
    .prepare("SELECT id, title, short_link_slug FROM events WHERE id = ?")
    .bind(eventId)
    .first<{ id: string; title: string; short_link_slug: string }>();
  const template = await db
    .prepare("SELECT id, name, status FROM form_templates WHERE id = ?")
    .bind(templateId)
    .first<{ id: string; name: string; status: string }>();

  if (!event || !template || template.status !== "active") {
    return null;
  }

  const suffix = crypto.randomUUID().slice(0, 8);
  const publishedFormId = `form_pub_${suffix}`;
  const publicationId = `pub_${suffix}`;
  const backupSlug = `${event.short_link_slug}-anterior-${suffix}`;
  const historicalStatus = `inactive_${suffix}`;
  const statements: D1PreparedStatement[] = [
    db
      .prepare(
        `UPDATE forms
         SET short_link_slug = ?, status = 'inactive', updated_at = CURRENT_TIMESTAMP
         WHERE event_id = ? AND short_link_slug = ?`
      )
      .bind(backupSlug, eventId, event.short_link_slug),
    db
      .prepare(
        "UPDATE event_form_publications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE event_id = ? AND status = 'active'"
      )
      .bind(historicalStatus, eventId),
    db
      .prepare(
        `INSERT INTO forms (id, event_id, name, status, short_link_slug, welcome_title_template, cloned_from_form_id, form_template_id)
         VALUES (?, ?, ?, 'active', ?, ?, NULL, ?)`
      )
      .bind(
        publishedFormId,
        eventId,
        template.name,
        event.short_link_slug,
        "Bienvenido a {{event.title}} - {{session.title}}: {{session.theme}}",
        template.id
      ),
    db
      .prepare(
        `INSERT INTO event_form_publications (id, event_id, form_template_id, published_form_id, status)
         VALUES (?, ?, ?, ?, 'active')`
      )
      .bind(publicationId, eventId, template.id, publishedFormId)
  ];

  await db.batch(statements);
  return db
    .prepare(
      `SELECT
        f.id,
        f.event_id,
        e.title AS event_title,
        f.name,
        f.status,
        f.short_link_slug,
        f.welcome_title_template,
        f.cloned_from_form_id,
        f.form_template_id,
        COUNT(DISTINCT fts.id) AS section_count,
        COUNT(DISTINCT ftf.id) AS field_count
       FROM forms f
       INNER JOIN events e ON e.id = f.event_id
       LEFT JOIN form_template_sections fts ON fts.template_id = f.form_template_id
       LEFT JOIN form_template_fields ftf ON ftf.template_id = f.form_template_id
       WHERE f.id = ?
       GROUP BY f.id`
    )
    .bind(publishedFormId)
    .first<AdminForm>();
}

export async function listAdminForms(db: D1Database, user: SessionUser) {
  const whereSql = canSeeAllEvents(user) ? "" : "WHERE e.created_by_user_id = ?";
  const statement = db.prepare(
    `SELECT
      f.id,
      f.event_id,
      e.title AS event_title,
      f.name,
      f.status,
      f.short_link_slug,
      f.welcome_title_template,
      f.cloned_from_form_id,
      f.form_template_id,
      COUNT(DISTINCT fs.id) AS section_count,
      COUNT(DISTINCT ff.id) AS field_count
     FROM forms f
     INNER JOIN events e ON e.id = f.event_id
     LEFT JOIN form_sections fs ON fs.form_id = f.id
     LEFT JOIN form_fields ff ON ff.form_id = f.id
     ${whereSql}
     GROUP BY f.id
     ORDER BY f.created_at DESC`
  );

  return canSeeAllEvents(user) ? statement.all<AdminForm>() : statement.bind(user.id).all<AdminForm>();
}

export async function listFormTemplates(db: D1Database) {
  return db
    .prepare(
      `SELECT
        ft.id,
        ft.name,
        ft.description,
        ft.status,
        ft.source_form_id,
        COUNT(DISTINCT fts.id) AS section_count,
        COUNT(DISTINCT ftf.id) AS field_count
       FROM form_templates ft
       LEFT JOIN form_template_sections fts ON fts.template_id = ft.id
       LEFT JOIN form_template_fields ftf ON ftf.template_id = ft.id
       WHERE ft.status = 'active'
       GROUP BY ft.id
       ORDER BY ft.name`
    )
    .all<FormTemplate>();
}

export async function getAdminForm(db: D1Database, formId: string, user: SessionUser) {
  const whereSql = canSeeAllEvents(user) ? "WHERE f.id = ?" : "WHERE f.id = ? AND e.created_by_user_id = ?";
  const statement = db.prepare(
    `SELECT
      f.id,
      f.event_id,
      e.title AS event_title,
      f.name,
      f.status,
      f.short_link_slug,
      f.welcome_title_template,
      f.cloned_from_form_id,
      f.form_template_id,
      COUNT(DISTINCT fs.id) AS section_count,
      COUNT(DISTINCT ff.id) AS field_count
     FROM forms f
     INNER JOIN events e ON e.id = f.event_id
     LEFT JOIN form_sections fs ON fs.form_id = f.id
     LEFT JOIN form_fields ff ON ff.form_id = f.id
     ${whereSql}
     GROUP BY f.id`
  );

  return canSeeAllEvents(user)
    ? statement.bind(formId).first<AdminForm>()
    : statement.bind(formId, user.id).first<AdminForm>();
}

export async function getFormStructure(db: D1Database, formId: string) {
  const form = await db
    .prepare("SELECT form_template_id FROM forms WHERE id = ?")
    .bind(formId)
    .first<{ form_template_id: string | null }>();

  if (form?.form_template_id) {
    const [sections, fields] = await Promise.all([
      db
        .prepare(
          `SELECT id, section_key, title, order_index
           FROM form_template_sections
           WHERE template_id = ?
           ORDER BY order_index`
        )
        .bind(form.form_template_id)
        .all<FormSection>(),
      db
        .prepare(
          `SELECT id, section_id, field_key, label, field_type, catalog_key, is_required, order_index, config
           FROM form_template_fields
           WHERE template_id = ?
           ORDER BY order_index`
        )
        .bind(form.form_template_id)
        .all<FormField>()
    ]);

    return {
      sections: sections.results.map((section) => ({
        ...section,
        fields: fields.results.filter((field) => field.section_id === section.id)
      }))
    };
  }

  const [sections, fields] = await Promise.all([
    db
      .prepare(
        `SELECT id, section_key, title, order_index
         FROM form_sections
         WHERE form_id = ?
         ORDER BY order_index`
      )
      .bind(formId)
      .all<FormSection>(),
    db
      .prepare(
        `SELECT id, section_id, field_key, label, field_type, catalog_key, is_required, order_index, config
         FROM form_fields
         WHERE form_id = ?
         ORDER BY order_index`
      )
      .bind(formId)
      .all<FormField>()
  ]);

  return {
    sections: sections.results.map((section) => ({
      ...section,
      fields: fields.results.filter((field) => field.section_id === section.id)
    }))
  };
}

export async function getPublicFormStructure(db: D1Database, formId: string) {
  const structure = await getFormStructure(db, formId);
  const catalogKeys = Array.from(
    new Set(
      structure.sections
        .flatMap((section) => section.fields)
        .map((field) => field.catalog_key)
        .filter((key): key is string => Boolean(key))
    )
  );
  const catalogs: Record<string, CatalogItem[]> = {};

  await Promise.all(
    catalogKeys.map(async (catalogKey) => {
      const items = await db
        .prepare(
          `SELECT i.id, i.catalog_id, i.parent_item_id, i.source_id, i.name, i.description, i.status
           FROM system_catalog_items i
           INNER JOIN system_catalogs c ON c.id = i.catalog_id
           WHERE c.catalog_key = ? AND i.status = 'active'
           ORDER BY CASE WHEN UPPER(i.name) LIKE 'OTRO%' THEN 1 ELSE 0 END, i.name
           LIMIT 2500`
        )
        .bind(catalogKey)
        .all<CatalogItem>();
      catalogs[catalogKey] = items.results;
    })
  );

  return { ...structure, catalogs };
}

export async function findParticipantByDocument(db: D1Database, documentType: string, documentNumber: string) {
  return db
    .prepare(
      `SELECT id, document_type, document_number, first_name, paternal_last_name, maternal_last_name, email, phone
       FROM participants
       WHERE document_type = ? AND document_number = ?
       LIMIT 1`
    )
    .bind(documentType, documentNumber)
    .first<Participant>();
}

export async function hasAttendance(db: D1Database, sessionId: string, participantId: string) {
  const row = await db
    .prepare("SELECT id FROM attendance_records WHERE session_id = ? AND participant_id = ? LIMIT 1")
    .bind(sessionId, participantId)
    .first<{ id: string }>();

  return Boolean(row);
}

export async function registerAttendance(db: D1Database, openSession: OpenSession, participantId: string, formId: string) {
  const attendanceId = `att_${crypto.randomUUID()}`;

  await db
    .prepare(
      `INSERT INTO attendance_records (id, event_id, module_id, session_id, participant_id, form_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(attendanceId, openSession.event_id, openSession.module_id, openSession.id, participantId, formId)
    .run();

  return attendanceId;
}

export async function createParticipant(db: D1Database, input: {
  documentType: string;
  documentNumber: string;
  firstName: string;
  paternalLastName?: string;
  maternalLastName?: string;
  email?: string;
  phone?: string;
  profileData: Record<string, unknown>;
}) {
  const participantId = `par_${crypto.randomUUID()}`;

  await db
    .prepare(
      `INSERT INTO participants (
        id, document_type, document_number, first_name, paternal_last_name, maternal_last_name, email, phone, profile_data
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      participantId,
      input.documentType,
      input.documentNumber,
      input.firstName,
      input.paternalLastName ?? null,
      input.maternalLastName ?? null,
      input.email ?? null,
      input.phone ?? null,
      JSON.stringify(input.profileData)
    )
    .run();

  return participantId;
}

export async function getAttendanceReportData(db: D1Database, eventId: string) {
  const event = await db
    .prepare("SELECT id, title, short_link_slug FROM events WHERE id = ?")
    .bind(eventId)
    .first<{ id: string; title: string; short_link_slug: string }>();
  const fields = await db
    .prepare(
      `SELECT field_key, label, MIN(order_index) AS order_index
       FROM (
         SELECT ff.field_key, ff.label, ff.order_index
         FROM form_fields ff
         INNER JOIN forms f ON f.id = ff.form_id
         WHERE f.event_id = ?
         UNION ALL
         SELECT ftf.field_key, ftf.label, ftf.order_index
         FROM form_template_fields ftf
         INNER JOIN forms f ON f.form_template_id = ftf.template_id
         WHERE f.event_id = ?
       )
       GROUP BY field_key, label
       ORDER BY order_index`
    )
    .bind(eventId, eventId)
    .all<{ field_key: string; label: string; order_index: number }>();
  const rows = await db
    .prepare(
      `SELECT
        ar.id AS attendance_id,
        ar.registered_at,
        ar.status AS attendance_status,
        m.title AS module_title,
        s.sequence AS session_sequence,
        s.title AS session_title,
        s.theme AS session_theme,
        s.session_date,
        s.start_time,
        s.end_time,
        p.document_type,
        p.document_number,
        p.first_name,
        p.paternal_last_name,
        p.maternal_last_name,
        p.email,
        p.phone,
        p.profile_data
       FROM attendance_records ar
       INNER JOIN participants p ON p.id = ar.participant_id
       INNER JOIN event_sessions s ON s.id = ar.session_id
       INNER JOIN event_modules m ON m.id = ar.module_id
       WHERE ar.event_id = ?
       ORDER BY s.sequence, ar.registered_at`
    )
    .bind(eventId)
    .all<{
      attendance_id: string;
      registered_at: string;
      attendance_status: string;
      module_title: string;
      session_sequence: number;
      session_title: string;
      session_theme: string;
      session_date: string;
      start_time: string;
      end_time: string;
      document_type: string;
      document_number: string;
      first_name: string;
      paternal_last_name: string | null;
      maternal_last_name: string | null;
      email: string | null;
      phone: string | null;
      profile_data: string;
    }>();

  return {
    event,
    fields: fields.results,
    rows: rows.results
  };
}

export async function updateFormStatus(db: D1Database, formId: string, status: string) {
  const result = await db
    .prepare("UPDATE forms SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(status, formId)
    .run();

  return result.meta.changes > 0;
}

export async function cloneForm(db: D1Database, sourceFormId: string, user: SessionUser) {
  const source = await getAdminForm(db, sourceFormId, user);

  if (!source) {
    return null;
  }

  const suffix = crypto.randomUUID().slice(0, 8);
  const cloneId = `form_clone_${suffix}`;
  const slug = `${source.short_link_slug}-copia-${suffix}`;
  const now = "CURRENT_TIMESTAMP";
  const sections = await db
    .prepare("SELECT id, section_key, title, order_index FROM form_sections WHERE form_id = ? ORDER BY order_index")
    .bind(sourceFormId)
    .all<FormSection>();
  const fields = await db
    .prepare(
      "SELECT id, section_id, field_key, label, field_type, catalog_key, is_required, order_index, config FROM form_fields WHERE form_id = ? ORDER BY order_index"
    )
    .bind(sourceFormId)
    .all<FormField>();

  const statements = [
    db
      .prepare(
        `INSERT INTO forms (id, event_id, name, status, short_link_slug, welcome_title_template, cloned_from_form_id)
         VALUES (?, ?, ?, 'draft', ?, ?, ?)`
      )
      .bind(cloneId, source.event_id, `${source.name} - copia`, slug, source.welcome_title_template, source.id)
  ];

  for (const section of sections.results) {
    const newSectionId = `${section.id}_${suffix}`;
    statements.push(
      db
        .prepare(
          `INSERT INTO form_sections (id, form_id, section_key, title, order_index, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ${now}, ${now})`
        )
        .bind(newSectionId, cloneId, section.section_key, section.title, section.order_index)
    );

    for (const field of fields.results.filter((item) => item.section_id === section.id)) {
      statements.push(
        db
          .prepare(
            `INSERT INTO form_fields (id, form_id, section_id, field_key, label, field_type, catalog_key, is_required, order_index, config, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${now}, ${now})`
          )
          .bind(
            `${field.id}_${suffix}`,
            cloneId,
            newSectionId,
            field.field_key,
            field.label,
            field.field_type,
            field.catalog_key,
            field.is_required,
            field.order_index,
            field.config
          )
      );
    }
  }

  await db.batch(statements);
  return getAdminForm(db, cloneId, user);
}

export async function listCatalogs(db: D1Database) {
  return db
    .prepare(
      `SELECT
        c.id,
        c.catalog_key,
        c.name,
        c.description,
        c.status,
        COUNT(i.id) AS item_count,
        COUNT(CASE WHEN i.status = 'active' THEN 1 END) AS active_item_count
       FROM system_catalogs c
       LEFT JOIN system_catalog_items i ON i.catalog_id = c.id
       GROUP BY c.id
       ORDER BY c.catalog_key`
    )
    .all<Catalog>();
}

export async function listCatalogItems(db: D1Database, catalogKey: string) {
  return db
    .prepare(
      `SELECT i.id, i.catalog_id, i.parent_item_id, i.source_id, i.name, i.description, i.status
       FROM system_catalog_items i
       INNER JOIN system_catalogs c ON c.id = i.catalog_id
       WHERE c.catalog_key = ?
       ORDER BY CASE WHEN UPPER(i.name) LIKE 'OTRO%' THEN 1 ELSE 0 END, i.name
       LIMIT 500`
    )
    .bind(catalogKey)
    .all<CatalogItem>();
}

export async function createCatalogItem(db: D1Database, catalogKey: string, name: string, description?: string) {
  const catalog = await db
    .prepare("SELECT id FROM system_catalogs WHERE catalog_key = ?")
    .bind(catalogKey)
    .first<{ id: string }>();

  if (!catalog) {
    return null;
  }

  const itemId = `catitem_${catalogKey}_${crypto.randomUUID().slice(0, 12)}`;
  await db
    .prepare(
      `INSERT INTO system_catalog_items (id, catalog_id, name, description, status)
       VALUES (?, ?, ?, ?, 'active')`
    )
    .bind(itemId, catalog.id, name, description ?? name)
    .run();

  return itemId;
}

export async function updateCatalogItemStatus(db: D1Database, itemId: string, status: string) {
  const result = await db
    .prepare("UPDATE system_catalog_items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(status, itemId)
    .run();

  return result.meta.changes > 0;
}

export async function listDepartments(db: D1Database) {
  return db
    .prepare(
      `SELECT iddepartamento AS id, name
       FROM location_departments
       WHERE status = 'active'
       ORDER BY name`
    )
    .all<LocationOption>();
}

export async function listProvincesByDepartment(db: D1Database, departmentId: string) {
  return db
    .prepare(
      `SELECT idprovincia AS id, name
       FROM location_provinces
       WHERE iddepartamento = ? AND status = 'active'
       ORDER BY name`
    )
    .bind(departmentId)
    .all<LocationOption>();
}

export async function listDistrictsByProvince(db: D1Database, provinceId: string) {
  return db
    .prepare(
      `SELECT iddistrito AS id, name
       FROM location_districts
       WHERE idprovincia = ? AND status = 'active'
       ORDER BY name`
    )
    .bind(provinceId)
    .all<LocationOption>();
}

export async function getUserForLogin(db: D1Database, login: string) {
  return db
    .prepare(
      `SELECT
        u.id,
        u.username,
        u.email,
        u.full_name,
        u.password_hash,
        u.status,
        GROUP_CONCAT(r.role_key) AS roles
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id AND r.status = 'active'
       WHERE (LOWER(u.username) = LOWER(?) OR LOWER(u.email) = LOWER(?))
         AND u.status = 'active'
       GROUP BY u.id`
    )
    .bind(login, login)
    .first<DbUserWithPassword>();
}
