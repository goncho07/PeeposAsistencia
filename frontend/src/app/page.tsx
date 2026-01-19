export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-primary/5 via-background to-primary/10">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-text-primary mb-4">
          Peepos Asistencia
        </h1>
        <p className="text-xl text-text-secondary mb-8">
          Sistema de control de asistencia escolar
        </p>

        <div className="card">
          <p className="text-text-secondary mb-4">
            Por favor accede con la URL de tu institución:
          </p>
          <code className="block bg-surface px-6 py-4 rounded-lg text-lg font-mono text-primary">
            /[slug-institucion]/login
          </code>

          <div className="mt-6 text-sm text-text-secondary">
            <p>Ejemplo: <code className="text-primary">/colegio-san-jose/login</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}