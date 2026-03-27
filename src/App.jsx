import { useMemo, useState } from 'react'

const NOTA_MINIMA_APROBACION = 60

function App() {
  const [practico, setPractico] = useState('0')
  const [pesoPractico, setPesoPractico] = useState('30')
  const [p1, setP1] = useState('0')
  const [p2, setP2] = useState('0')
  const [mejoramiento, setMejoramiento] = useState('')
  const [resultado, setResultado] = useState(null)

  const toNumber = (value) => {
    if (value === '' || value === null || value === undefined) return null
    const parsed = Number.parseFloat(value)
    return Number.isNaN(parsed) ? null : parsed
  }

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

  const calcularPromedio = ({ practicoNota, practicoPeso, parcial1, parcial2 }) => {
    const peso = practicoPeso / 100
    const promedioParciales = (parcial1 + parcial2) / 2
    return (1 - peso) * promedioParciales + peso * practicoNota
  }

  const calcular = (event) => {
    event.preventDefault()

    const practicoNota = clamp(toNumber(practico) ?? 0, 0, 100)
    const practicoPeso = clamp(toNumber(pesoPractico) ?? 30, 0, 100)
    const parcial1 = clamp(toNumber(p1) ?? 0, 0, 100)
    const parcial2 = clamp(toNumber(p2) ?? 0, 0, 100)
    const notaMejoramiento = toNumber(mejoramiento)
    const tieneMejoramiento = `${mejoramiento}`.trim() !== '' && notaMejoramiento !== null

    let p1Final = parcial1
    let p2Final = parcial2
    let reemplazoAplicado = false

    if (tieneMejoramiento) {
      const mejora = clamp(notaMejoramiento, 0, 100)
      if (parcial1 <= parcial2) {
        if (mejora > parcial1) {
          p1Final = mejora
          reemplazoAplicado = true
        }
      } else if (mejora > parcial2) {
        p2Final = mejora
        reemplazoAplicado = true
      }
    }

    const promedioFinal = calcularPromedio({
      practicoNota,
      practicoPeso,
      parcial1: p1Final,
      parcial2: p2Final,
    })
    const aprobo = promedioFinal >= NOTA_MINIMA_APROBACION

    const parcialAlto = Math.max(parcial1, parcial2)
    const pesoParciales = (100 - practicoPeso) / 100
    const denominador = pesoParciales / 2
    const numerador =
      NOTA_MINIMA_APROBACION - (practicoPeso / 100) * practicoNota - denominador * parcialAlto
    const necesariaSinLimites = denominador <= 0 ? Infinity : numerador / denominador
    const notaNecesariaMejoramiento = clamp(necesariaSinLimites, 0, 100)
    const puedePasarConMejoramiento = necesariaSinLimites <= 100

    setResultado({
      practicoPeso,
      promedioFinal,
      aprobo,
      reemplazoAplicado,
      notaMejoramiento: tieneMejoramiento ? clamp(notaMejoramiento, 0, 100) : null,
      notaNecesariaMejoramiento,
      puedePasarConMejoramiento,
    })
  }

  const resultadoColor = useMemo(() => {
    if (!resultado) return ''
    return resultado.aprobo
      ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
      : 'border-rose-400/40 bg-rose-500/10 text-rose-100'
  }, [resultado])

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Calculadora ESPOL</h1>
          <p className="mt-2 text-sm text-slate-400">Calculadora ESPOL </p>
        </header>

        <form
          onSubmit={calcular}
          className="grid gap-4 rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-xl sm:grid-cols-2 sm:p-6"
        >
          <InputNota
            label="Componente práctico"
            value={practico}
            onChange={setPractico}
          />
          <InputNota
            label="% del práctico"
            value={pesoPractico}
            onChange={setPesoPractico}
            max="100"
            step="0.1"
          />
          <InputNota label="Primer parcial (P1)" value={p1} onChange={setP1} />
          <InputNota label="Segundo parcial (P2)" value={p2} onChange={setP2} />
          <InputNota
            label="Mejoramiento (opcional)"
            value={mejoramiento}
            onChange={setMejoramiento}
            placeholder="Deja vacío si no aplica"
          />

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 active:scale-[0.99] sm:text-base"
            >
              Calcular
            </button>
          </div>
        </form>

        {resultado && (
          <section
            className={`mt-6 rounded-2xl border p-5 sm:p-6 ${resultadoColor} ${
              resultado.aprobo ? 'animate-pass' : 'animate-fail'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{resultado.aprobo ? '🎉' : '😕'}</span>
              <h2 className="text-xl font-bold sm:text-2xl">
                {resultado.aprobo ? 'Aprobaste la materia' : 'No aprobaste la materia'}
              </h2>
            </div>

            <p className="mt-3 text-base sm:text-lg">
              Promedio final: <strong>{(resultado.promedioFinal / 10).toFixed(2)}</strong>
            </p>

            {!resultado.aprobo && (
              <div className="mt-4 rounded-xl border border-amber-300/30 bg-amber-400/10 p-4 text-amber-100">
                {resultado.puedePasarConMejoramiento ? (
                  <p className="text-sm sm:text-base">
                    Necesitas al menos <strong>{resultado.notaNecesariaMejoramiento.toFixed(2)}</strong>{' '}
                    en mejoramiento para pasar.
                  </p>
                ) : (
                  <p className="text-sm sm:text-base">
                    Con esta combinación, ni 100.00 en mejoramiento alcanza para llegar a 60.
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        <footer className="mt-10 border-t border-slate-800 pt-6 text-center text-sm text-slate-400">
          <p>© Copyright {new Date().getFullYear()} Moises Alvarez</p>
          <div className="mt-3 flex items-center justify-center gap-4">
            <a
              href="https://www.linkedin.com/in/mdfalvarez/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn de Moises Alvarez"
              className="rounded-lg p-2 transition hover:bg-slate-800 hover:text-cyan-300"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3C4.17 3 3.3 3.88 3.3 4.97s.87 1.97 1.95 1.97 1.95-.88 1.95-1.97S6.33 3 5.25 3Zm15.45 9.9c0-3.37-1.8-4.94-4.2-4.94-1.94 0-2.8 1.07-3.28 1.82V8.5H9.84V20h3.38v-5.7c0-1.5.29-2.95 2.14-2.95 1.82 0 1.84 1.7 1.84 3.05V20h3.5v-7.1Z" />
              </svg>
            </a>
            <a
              href="https://github.com/mfalvarezd"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub de Moises Alvarez"
              className="rounded-lg p-2 transition hover:bg-slate-800 hover:text-cyan-300"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.6 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.38-3.37-1.38-.46-1.2-1.12-1.52-1.12-1.52-.92-.64.07-.63.07-.63 1.01.08 1.54 1.08 1.54 1.08.9 1.58 2.36 1.12 2.94.86.09-.67.35-1.12.64-1.38-2.22-.26-4.55-1.14-4.55-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.9a9.3 9.3 0 0 1 2.5.35c1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.21 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.95-2.33 4.82-4.56 5.08.36.32.68.95.68 1.92 0 1.38-.01 2.5-.01 2.84 0 .27.18.6.69.49A10.28 10.28 0 0 0 22 12.26C22 6.6 17.52 2 12 2Z" />
              </svg>
            </a>
          </div>
        </footer>
      </div>
    </main>
  )
}

function InputNota({ label, value, onChange, placeholder = '', max = '100', step = '0.01' }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <input
        type="number"
        min="0"
        max={max}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40"
      />
    </label>
  )
}

export default App
