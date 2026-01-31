import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
      {/* Navbar */}
      <header className="flex h-16 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 lg:px-12 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          {/* Logo placeholder - maybe a padel racket icon later */}
          <div className="h-8 w-8 rounded-full bg-lime-400 flex items-center justify-center">
             <span className="font-bold text-zinc-900">P</span>
          </div>
          <span className="text-xl font-bold tracking-tight">PadeLink</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="/professors" className="hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
            Profesores
          </Link>
          <Link href="/login" className="hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-zinc-900 px-4 py-2 text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-lime-400 dark:text-zinc-900 dark:hover:bg-lime-500"
          >
            Registrarse
          </Link>
        </nav>
        {/* Mobile menu button could go here */}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-lime-100 via-white to-white dark:from-lime-900/20 dark:via-zinc-950 dark:to-zinc-950"></div>
          <div className="container mx-auto px-6 text-center lg:px-12">
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl text-zinc-900 dark:text-white">
              Lleva tu juego al <span className="text-lime-600 dark:text-lime-400">siguiente nivel</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              Encuentra los mejores profesores, reserva canchas y conecta con otros apasionados del pádel. La comunidad que estabas esperando.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="h-12 rounded-full bg-lime-500 px-8 text-base font-semibold text-white transition-all hover:bg-lime-600 hover:shadow-lg dark:bg-lime-400 dark:text-zinc-900 dark:hover:bg-lime-500"
                style={{ display: 'flex', alignItems: 'center' }}
              >
                Empezar ahora
              </Link>
              <Link
                href="/professors"
                className="flex h-12 items-center justify-center rounded-full border border-zinc-200 bg-white px-8 text-base font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 hover:text-lime-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
              >
                Ver profesores
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400">
                    {/* Icon placeholder */}
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h3 className="mb-2 text-xl font-bold">Profesores Expertos</h3>
                <p className="text-zinc-600 dark:text-zinc-400">Accede a una red de entrenadores certificados listos para mejorar tu técnica.</p>
              </div>
               {/* Feature 2 */}
               <div className="rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="mb-2 text-xl font-bold">Reserva Fácil</h3>
                <p className="text-zinc-600 dark:text-zinc-400">Encuentra y reserva tu cancha favorita en segundos desde cualquier dispositivo.</p>
              </div>
               {/* Feature 3 */}
               <div className="rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="mb-2 text-xl font-bold">Comunidad Activa</h3>
                <p className="text-zinc-600 dark:text-zinc-400">Únete a torneos, encuentra pareja de juego y comparte tu pasión.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="container mx-auto px-6 text-center text-sm text-zinc-500 dark:text-zinc-400 lg:px-12">
          <p>&copy; {new Date().getFullYear()} PadeLink. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
