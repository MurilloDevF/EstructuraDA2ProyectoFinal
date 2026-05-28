import React, { useContext, useState, useEffect } from 'react';
import { HospitalContext } from '../../context/HospitalContext';
import { dbService } from '../../firebase';
import styles from './Index.module.scss';
import { Users, AlertTriangle, Clock, ArrowLeft, Eye } from 'lucide-react';

export const AdminDashboard = () => {
  const {
    doctors,
    generalQueue,
    triageHeap,
    currentHistoryView,
    pushToHistory,
    popFromHistory,
    resolveFirstConsultation,
    resolveHighestTriage,
    loading,
    error
  } = useContext(HospitalContext);

  const [activePatientRecord, setActivePatientRecord] = useState(null);
  const [initializingDoctors, setInitializingDoctors] = useState(false);
  const [doctorsInitialized, setDoctorsInitialized] = useState(false);
  
  // Simulated Patient Record Database for consultation
  const [patientsDB] = useState([
    { id: "P-101", name: "Mateo Valenzuela", age: 34, diagnosis: "Gripe común, reposo absoluto de 3 días.", lastVisit: "15/05/2026" },
    { id: "P-102", name: "Lucía Fernández", age: 5, diagnosis: "Fiebre y tos leve. Se prescribe ibuprofeno infantil.", lastVisit: "22/05/2026" },
    { id: "P-103", name: "Andrés Delgado", age: 62, diagnosis: "Hipertensión arterial controlada con Losartán.", lastVisit: "10/04/2026" },
    { id: "P-104", name: "Camila Ortiz", age: 28, diagnosis: "Dermatitis de contacto, aplicar crema corticoide.", lastVisit: "18/05/2026" }
  ]);

  const handleResolveConsultation = async () => {
    try {
      await resolveFirstConsultation();
    } catch (err) {
      alert("Error al atender consulta: " + err.message);
    }
  };

  const handleResolveEmergency = async () => {
    try {
      await resolveHighestTriage();
    } catch (err) {
      alert("Error al despachar emergencia: " + err.message);
    }
  };

  const handleViewPatientFile = (patient) => {
    pushToHistory(patient);
    setActivePatientRecord(patient);
  };

  const handleBackPatientFile = () => {
    popFromHistory(); // Pop active file
    
    // Look at previous file if any remains in the history stack
    if (currentHistoryView.length > 1) {
      const prev = currentHistoryView[currentHistoryView.length - 2];
      setActivePatientRecord(prev);
    } else {
      setActivePatientRecord(null);
    }
  };

  useEffect(() => {
    if (doctors.length > 0) {
      setDoctorsInitialized(true);
    }
  }, [doctors.length]);

  const handleInitializeDoctors = async () => {
    setInitializingDoctors(true);
    try {
      const result = await dbService.initializeDoctors();
      if (result.success) {
        alert("✅ " + result.message);
        setDoctorsInitialized(true);
      } else {
        alert("ℹ️ " + result.message);
        setDoctorsInitialized(true);
      }
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setInitializingDoctors(false);
    }
  };

  const consultationsList = generalQueue.toArray();
  const triageList = triageHeap.toArray();
  const nextConsultation = generalQueue.peek();
  const nextEmergency = triageHeap.peek();

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3>Cargando información del hospital...</h3>
          <p>Espera un momento mientras se sincroniza la cola de consultas y las urgencias.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.dashboardHeader}>
        <h2>Panel de Control Médico e Historiales</h2>
        <p>Monitoreo de colas generales en tiempo real y revisión de expedientes clínicos.</p>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', backgroundColor: '#fff5f5', borderLeft: '4px solid #f56565', color: '#742a2a' }}>
          <strong>⚠️ Error de Firestore:</strong> {error}
        </div>
      )}

      {!doctorsInitialized && doctors.length === 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem', backgroundColor: '#fffbea', borderLeft: '4px solid #f6ad55' }}>
          <p style={{ marginBottom: '1rem', color: '#744210' }}>
            <strong>⚠️ Importante:</strong> La colección de médicos está incompleta. Haz clic para inicializar automáticamente los 5 médicos en Firestore.
          </p>
          <button 
            onClick={handleInitializeDoctors}
            disabled={initializingDoctors}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f6ad55',
              color: '#744210',
              border: 'none',
              borderRadius: '4px',
              cursor: initializingDoctors ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {initializingDoctors ? '⏳ Inicializando médicos...' : '✅ Inicializar Médicos en Firestore'}
          </button>
        </div>
      )}

      <div className={styles.layout}>
        {/* Left Column: Queues and Priority lists */}
        <div className={styles.queuesCol}>
          {/* Triage Urgencias (Min-Heap Visualization) */}
          <div className="card" style={{ borderColor: 'var(--danger)' }}>
            <div className={styles.cardHeader}>
              <AlertTriangle style={{ color: 'var(--danger)' }} />
              <h3>Cola de Urgencias Triage (Min-Heap)</h3>
              <span className="badge" style={{ backgroundColor: 'var(--danger)' }}>
                {triageList.length} Emergencias
              </span>
            </div>
            
            {nextEmergency ? (
              <div className={styles.dispatchBox}>
                <div className={styles.patientBanner}>
                  <div>
                    <strong>Siguiente Emergencia Crítica:</strong>
                    <h4>{nextEmergency.patientName}</h4>
                    <p>Ubicación: {nextEmergency.location} | Gravedad: {nextEmergency.severity}</p>
                  </div>
                  <button onClick={handleResolveEmergency} className="btn btn-danger">
                    Despachar Ambulancia
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.emptyAlert}>No hay emergencias críticas reportadas.</div>
            )}

            {triageList.length > 0 && (
              <div className={styles.triageQueueList}>
                <h4>Lista Completa Triage (Ordenada por prioridad Min-Heap)</h4>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Prioridad</th>
                        <th>Paciente</th>
                        <th>Ubicación</th>
                        <th>Nivel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {triageList.map((t, idx) => (
                        <tr key={t.id} style={{ opacity: idx === 0 ? 1 : 0.7 }}>
                          <td><strong>#{t.priority}</strong></td>
                          <td>{t.patientName}</td>
                          <td>{t.location}</td>
                          <td>
                            <span className={styles.triageBadge} style={{ backgroundColor: `var(--triage-${t.priority})` }}>
                              {t.severity.split(" ")[0]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Consulta General (FIFO Queue Visualization) */}
          <div className="card">
            <div className={styles.cardHeader}>
              <Users style={{ color: 'var(--primary)' }} />
              <h3>Cola de Consulta General (FIFO)</h3>
              <span className="badge" style={{ backgroundColor: 'var(--primary)' }}>
                {consultationsList.length} En Espera
              </span>
            </div>

            {nextConsultation ? (
              <div className={styles.dispatchBox} style={{ backgroundColor: '#ebf8ff', borderColor: '#bee3f8' }}>
                <div className={styles.patientBanner}>
                  <div>
                    <strong>Siguiente en la fila:</strong>
                    <h4>{nextConsultation.patientName}</h4>
                    <p>Motivo: {nextConsultation.reason}</p>
                  </div>
                  <button onClick={handleResolveConsultation} className="btn btn-primary">
                    Llamar Paciente
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.emptyAlert}>No hay pacientes esperando en consulta general.</div>
            )}

            {consultationsList.length > 0 && (
              <div className={styles.triageQueueList}>
                <h4>Fila de Espera General (Orden de llegada)</h4>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Turno</th>
                        <th>Paciente</th>
                        <th>Sintomas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultationsList.map((c, idx) => (
                        <tr key={c.id} style={{ opacity: idx === 0 ? 1 : 0.7 }}>
                          <td><strong>#{idx + 1}</strong></td>
                          <td>{c.patientName}</td>
                          <td>{c.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Patient File consultation history (Stack) */}
        <div className={styles.historyCol}>
          <div className="card">
            <div className={styles.cardHeader}>
              <Clock style={{ color: 'var(--info)' }} />
              <h3>Expedientes e Historial de Consulta (Stack)</h3>
            </div>

            <p className={styles.historyDesc}>
              Consulta el expediente de un paciente. El sistema mantendrá un historial de tu sesión usando un **Stack (Pila)**, permitiéndote retroceder.
            </p>

            <div className={styles.patientSearchList}>
              <h4>Directorio de Pacientes Registrados</h4>
              <div className={styles.dbButtonsGrid}>
                {patientsDB.map(patient => (
                  <button 
                    key={patient.id} 
                    onClick={() => handleViewPatientFile(patient)}
                    className={`${styles.patientBtn} ${activePatientRecord?.id === patient.id ? styles.patientBtnActive : ''}`}
                  >
                    <Eye size={14} />
                    <span>{patient.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active view detail */}
            {activePatientRecord && (
              <div className={styles.activeRecordBox}>
                <div className={styles.activeRecordHeader}>
                  <h4>Expediente Clínico: {activePatientRecord.name}</h4>
                  <button onClick={handleBackPatientFile} className={styles.backBtn}>
                    <ArrowLeft size={14} />
                    <span>Retroceder (Pop)</span>
                  </button>
                </div>
                <div className={styles.recordBody}>
                  <p><strong>ID Paciente:</strong> {activePatientRecord.id}</p>
                  <p><strong>Edad:</strong> {activePatientRecord.age} años</p>
                  <p><strong>Última Consulta:</strong> {activePatientRecord.lastVisit}</p>
                  <div className={styles.diagnosisBox}>
                    <strong>Diagnóstico General:</strong>
                    <p>{activePatientRecord.diagnosis}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Stack list representation */}
            <div className={styles.stackVisualization}>
              <h4>Historial de Sesión Actual (Visualización Stack)</h4>
              {currentHistoryView.length > 0 ? (
                <div className={styles.stackContainer}>
                  {currentHistoryView.slice().reverse().map((patient, idx) => (
                    <div 
                      key={idx} 
                      className={`${styles.stackElement} ${idx === 0 ? styles.stackTop : ''}`}
                    >
                      {idx === 0 && <span className={styles.topBadge}>PEEK (TOPE)</span>}
                      <strong>{patient.name}</strong>
                      <span className={styles.stackId}>{patient.id}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyStack}>La pila del historial de consultas está vacía. Abre un expediente.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
