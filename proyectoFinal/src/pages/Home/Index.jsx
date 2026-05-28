import React, { useState, useContext, useMemo } from 'react';
import { HospitalContext } from '../../context/HospitalContext';
import { useAuth } from '../../hooks/useAuth';
import { CardItem } from '../../components/Index/CardItem';
import styles from './Index.module.scss';
import { Search, PlusCircle, ShieldAlert, Heart } from 'lucide-react';

const normalizeSearchTerm = (value = '') => {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

export const Home = () => {
  const { currentUser } = useAuth();
  const { 
    doctors, 
    searchTrie, 
    registerGeneralConsultation, 
    registerEmergency,
    bookDoctorAppointment,
    loading
  } = useContext(HospitalContext);

  const [searchQuery, setSearchQuery] = useState('');
  
  // Forms state
  const [generalReason, setGeneralReason] = useState('');
  const [generalSuccess, setGeneralSuccess] = useState(false);

  const [emergencyLocation, setEmergencyLocation] = useState('Zona Residencial A');
  const [emergencySeverity, setEmergencySeverity] = useState('3'); // Triage priority (1: Red, 5: Blue)
  const [emergencySuccess, setEmergencySuccess] = useState(false);

  const searchResults = useMemo(() => {
    const normalizedQuery = normalizeSearchTerm(searchQuery);

    if (normalizedQuery === '') {
      return [];
    }

    const trieResults = searchTrie.search(normalizedQuery);
    if (trieResults.length > 0) {
      return trieResults;
    }

    return doctors.filter((doctor) => {
      const doctorName = normalizeSearchTerm(doctor.name);
      const doctorSpecialty = normalizeSearchTerm(doctor.specialty);
      return doctorName.includes(normalizedQuery) || doctorSpecialty.includes(normalizedQuery);
    });
  }, [doctors, searchTrie, searchQuery]);

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    if (!generalReason.trim()) return;

    try {
      await registerGeneralConsultation(currentUser.name, generalReason);
      setGeneralReason('');
      setGeneralSuccess(true);
      setTimeout(() => setGeneralSuccess(false), 4000);
    } catch (err) {
      alert("Error al registrar consulta general: " + err.message);
    }
  };

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    
    // Severity mapping
    const severityMap = {
      "1": "Rojo (Crítico/Emergencia)",
      "2": "Naranja (Muy Urgente)",
      "3": "Amarillo (Urgente)",
      "4": "Verde (Menor Urgencia)",
      "5": "Azul (No Urgente)"
    };

    const priority = parseInt(emergencySeverity);
    const severityText = severityMap[emergencySeverity];

    try {
      await registerEmergency(currentUser.name, emergencyLocation, severityText, priority);
      setEmergencySuccess(true);
      setTimeout(() => setEmergencySuccess(false), 4000);
    } catch (err) {
      alert("Error al reportar emergencia: " + err.message);
    }
  };

  const handleBook = async (doctorId) => {
    await bookDoctorAppointment(doctorId, currentUser.name);
  };

  // Show searchResults if query exists, otherwise show all doctors
  const doctorsToShow = searchQuery ? searchResults : doctors;

  return (
    <div className="container">
      <div className={styles.welcome}>
        <Heart className={styles.welcomeIcon} size={28} />
        <div>
          <h2>¡Bienvenido, {currentUser.name}!</h2>
          <p>Portal del Paciente. Agenda turnos presenciales o solicita asistencia de emergencia inmediata.</p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Left Column: Booking & Search */}
        <div className={styles.mainCol}>
          <div className="card">
            <h2 className={styles.sectionTitle}>Reservar Citas Especializadas</h2>
            <p className={styles.sectionSubtitle}>
              Busca por nombre de médico o por especialidad (ej. Cardiología, Neurología, Pediatría)
            </p>

            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} size={20} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Buscar médico o especialidad..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
              />
            </div>

            {searchQuery && !loading && (
              <div className={styles.searchStatus}>
                Mostrando {doctorsToShow.length} resultados usando autocompletado Trie
              </div>
            )}

            <div className={styles.grid}>
              {loading ? (
                <div className={styles.noResults}>
                  Cargando médicos y datos del hospital... Por favor espera.
                </div>
              ) : doctorsToShow.length > 0 ? (
                doctorsToShow.map(doc => (
                  <CardItem 
                    key={doc.id} 
                    doctor={doc} 
                    onBook={handleBook} 
                  />
                ))
              ) : (
                <div className={styles.noResults}>
                  No se encontraron médicos disponibles.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Admission queues */}
        <div className={styles.sideCol}>
          {/* General Consultation Form (FIFO Queue) */}
          <div className="card">
            <h3 className={styles.sideTitle}>
              <PlusCircle className={styles.titleIcon} size={20} />
              Consulta Médica General
            </h3>
            <p className={styles.sideDesc}>
              Únete a la cola de atención general en tiempo real (lógica FIFO). Un médico general te llamará.
            </p>

            {generalSuccess ? (
              <div className={styles.successAlert}>
                ¡Registro exitoso! Has sido ingresado en la cola de atención general.
              </div>
            ) : (
              <form onSubmit={handleGeneralSubmit}>
                <div className="form-group">
                  <label>Motivo de Consulta / Síntomas</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    required 
                    placeholder="Describe brevemente tus síntomas..."
                    value={generalReason}
                    onChange={(e) => setGeneralReason(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Ingresar a la Cola General
                </button>
              </form>
            )}
          </div>

          {/* Emergency Triage Form (Min-Heap Priority Queue) */}
          <div className="card" style={{ borderColor: 'var(--danger)' }}>
            <h3 className={styles.sideTitle} style={{ color: 'var(--danger)' }}>
              <ShieldAlert className={styles.titleIcon} size={20} />
              Solicitud de Ambulancia (Urgencias)
            </h3>
            <p className={styles.sideDesc}>
              Reporta una emergencia de salud. Serás posicionado en la cola de prioridad Triage (Min-Heap).
            </p>

            {emergencySuccess ? (
              <div className={styles.successAlert} style={{ backgroundColor: '#fff5f5', color: '#c53030', borderColor: '#fed7d7' }}>
                ¡Emergencia reportada! Tu solicitud de ambulancia ha sido prioritizada en el Triage.
              </div>
            ) : (
              <form onSubmit={handleEmergencySubmit}>
                <div className="form-group">
                  <label>Ubicación de la Emergencia</label>
                  <select 
                    className="form-control" 
                    value={emergencyLocation}
                    onChange={(e) => setEmergencyLocation(e.target.value)}
                  >
                    <option value="Zona Residencial A">Zona Residencial A</option>
                    <option value="Zona Comercial B">Zona Comercial B</option>
                    <option value="Zona Industrial C">Zona Industrial C</option>
                    <option value="Urbanización D">Urbanización D</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Nivel de Gravedad (Código Triage)</label>
                  <select 
                    className="form-control" 
                    value={emergencySeverity}
                    onChange={(e) => setEmergencySeverity(e.target.value)}
                  >
                    <option value="1">Rojo - Emergencia Crítica (Prioridad 1)</option>
                    <option value="2">Naranja - Muy Urgente (Prioridad 2)</option>
                    <option value="3">Amarillo - Urgente (Prioridad 3)</option>
                    <option value="4">Verde - Menos Urgente (Prioridad 4)</option>
                    <option value="5">Azul - No Urgente (Prioridad 5)</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-danger" style={{ width: '100%' }}>
                  Solicitar Ambulancia de Urgencia
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
