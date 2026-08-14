import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type PublicFormResponse = {
  ok: boolean;
  canRegister: boolean;
  message?: string;
  welcomeTitle?: string;
  event?: {
    title: string;
    start_date: string;
    end_date: string;
  };
  openSession?: {
    title: string;
    theme: string;
    session_date: string;
    start_time: string;
    end_time: string;
    module_title: string;
  } | null;
};

function App() {
  const path = window.location.pathname;

  if (path.startsWith("/f/")) {
    return <PublicAttendanceForm slug={path.replace("/f/", "") || "inauguracion-otca"} />;
  }

  return <AdminShell />;
}

function AdminShell() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">A</span>
          <div>
            <strong>Asistencia</strong>
            <small>Gestión de eventos</small>
          </div>
        </div>
        <nav className="nav-list">
          <a className="active" href="#eventos">Eventos</a>
          <a href="#formularios">Formularios</a>
          <a href="#reportes">Reportes</a>
          <a href="#configuracion">Configuración</a>
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">MVP en desarrollo</p>
            <h1>Panel de administración</h1>
          </div>
          <button className="button secondary" type="button">Cerrar sesión</button>
        </header>

        <section className="summary-grid" aria-label="Resumen del sistema">
          <Metric label="Eventos" value="1" />
          <Metric label="Módulos" value="5" />
          <Metric label="Sesiones" value="14" />
          <Metric label="Sesión abierta" value="0" />
        </section>

        <section className="workspace-section" id="eventos">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Evento de prueba</p>
              <h2>Inauguración OTCA</h2>
            </div>
            <div className="actions">
              <a className="button secondary" href="/f/inauguracion-otca">Abrir formulario</a>
              <button className="button" type="button">Crear evento</button>
            </div>
          </div>

          <div className="event-panel">
            <div>
              <h3>Comunidad de Práctica en Manejo Forestal Comunitario Amazónico</h3>
              <p>
                Estructura inicial lista para administrar módulos, sesiones, formularios clonables,
                enlace corto, QR y reportes exportables.
              </p>
            </div>
            <dl>
              <div>
                <dt>Periodo</dt>
                <dd>21/08/2026 - 21/11/2026</dd>
              </div>
              <div>
                <dt>Horario</dt>
                <dd>08:00 - 17:00</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd><span className="status closed">Cerrado</span></dd>
              </div>
            </dl>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PublicAttendanceForm({ slug }: { slug: string }) {
  const [data, setData] = React.useState<PublicFormResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch(`/api/public/forms/${slug}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("No se pudo cargar el formulario.");
        }
        return response.json() as Promise<PublicFormResponse>;
      })
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, [slug]);

  if (error) {
    return <PublicMessage title="Formulario no disponible" message={error} />;
  }

  if (!data) {
    return <PublicMessage title="Cargando formulario" message="Estamos consultando la sesión activa." />;
  }

  if (!data.canRegister || !data.openSession) {
    return (
      <PublicMessage
        title={data.event?.title ?? "Asistencia"}
        message={data.message ?? "No se puede registrar asistencia en este momento."}
      />
    );
  }

  return (
    <main className="public-page">
      <section className="public-form">
        <p className="eyebrow">Formulario público</p>
        <h1>{data.welcomeTitle}</h1>
        <div className="session-strip">
          <span>{data.openSession.module_title}</span>
          <span>{data.openSession.session_date}</span>
          <span>{data.openSession.start_time} - {data.openSession.end_time}</span>
        </div>

        <form className="document-form">
          <label>
            Tipo de documento
            <select defaultValue="DNI/CEDULA">
              <option>DNI/CEDULA</option>
              <option>CARNET EXTRANJERIA</option>
              <option>PASAPORTE</option>
              <option>OTRO</option>
            </select>
          </label>
          <label>
            Número de documento
            <input type="text" inputMode="numeric" placeholder="Ingrese su documento" />
          </label>
          <button className="button" type="button">Continuar</button>
        </form>
      </section>
    </main>
  );
}

function PublicMessage({ title, message }: { title: string; message: string }) {
  return (
    <main className="public-page">
      <section className="public-form compact">
        <p className="eyebrow">Asistencia</p>
        <h1>{title}</h1>
        <p className="blocked-message">{message}</p>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
