import { useState } from 'react';
import CalendarScheduler from './components/CalendarScheduler';

function App() {
  const [dayQuantity, setDayQuantity] = useState(7);
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(18);
  const [view, setView] = useState<'week' | 'day' | 'weekdays'>('week');

  // Preset configurations
  const presets = [
    { label: 'Día laboral (9-17)', start: 9, end: 17, days: 1 },
    { label: 'Semana laboral', start: 8, end: 18, days: 5, weekdaysOnly: true },
    { label: 'Semana completa', start: 8, end: 20, days: 7 },
  ];

  const applyPreset = (preset: { start: number; end: number; days: number; weekdaysOnly?: boolean }) => {
    setStartHour(preset.start);
    setEndHour(preset.end);
    setDayQuantity(preset.days);
    if (preset.weekdaysOnly) {
      setView('weekdays');
    } else {
      setView(preset.days === 1 ? 'day' : 'week');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Calendario de Actividades</h1>
        </header>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="border-b border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center">
                  <label className="block text-sm font-medium text-gray-700 mr-2">
                    Días:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dayQuantity}
                    onChange={(e) => setDayQuantity(Number(e.target.value))}
                    className="w-16 p-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <label className="block text-sm font-medium text-gray-700 mr-2">
                    Desde:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={startHour}
                    onChange={(e) => setStartHour(Number(e.target.value))}
                    className="w-16 p-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <label className="block text-sm font-medium text-gray-700 mr-2">
                    Hasta:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={endHour}
                    onChange={(e) => setEndHour(Number(e.target.value))}
                    className="w-16 p-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="hidden md:block h-8 w-px bg-gray-300 mx-2"></div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-1 bg-gray-200 p-0.5 rounded-md">
                  <button
                    className={`px-3 py-1 text-sm rounded-md transition ${
                      view === 'day'
                        ? 'bg-white shadow-sm text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setView('day');
                      setDayQuantity(1);
                    }}
                  >
                    Día
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded-md transition ${
                      view === 'weekdays'
                        ? 'bg-white shadow-sm text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setView('weekdays');
                      setDayQuantity(5);
                    }}
                  >
                    Laboral
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded-md transition ${
                      view === 'week'
                        ? 'bg-white shadow-sm text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setView('week');
                      setDayQuantity(7);
                    }}
                  >
                    Semana
                  </button>
                </div>

                <div className="relative inline-block">
                  <select
                    className="block w-full pl-3 pr-10 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => {
                      const index = parseInt(e.target.value);
                      if (index >= 0) {
                        applyPreset(presets[index]);
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Configuraciones rápidas
                    </option>
                    {presets.map((preset, index) => (
                      <option key={index} value={index}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <CalendarScheduler 
              dayQuantity={dayQuantity} 
              startHour={startHour} 
              endHour={endHour}
              weekdaysOnly={view === 'weekdays'}
              onTaskClick={(task) => {
                alert(`Detalles de la tarea:\n\nTítulo: ${task.title}\nHorario: ${new Date(task.start).toLocaleTimeString()} - ${new Date(task.end).toLocaleTimeString()}\nDescripción: ${task.description || 'Sin descripción'}`);
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 text-sm text-gray-600">
          <p className="mb-2">
            <strong>Tip:</strong> Haz clic en una tarea para ver más detalles o editarla.
          </p>
          <p>
            Puedes cambiar la vista rápidamente usando los botones de "Día" y "Semana",
            o ajustar manualmente la cantidad de días y el rango horario que deseas ver.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;