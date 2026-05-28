import React, { useState } from 'react';
import styles from './CardItem.module.scss';
import { Calendar, User, Clock, Check } from 'lucide-react';

export const CardItem = ({ doctor, onBook }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBook = async () => {
    setLoading(true);
    try {
      await onBook(doctor.id);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.message || "Error al agendar cita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          <User size={24} className={styles.icon} />
        </div>
        <div className={styles.info}>
          <h3 className={styles.name}>{doctor.name}</h3>
          <span className={styles.specialty}>{doctor.specialty}</span>
        </div>
      </div>
      
      <div className={styles.body}>
        <div className={styles.detail}>
          <Clock size={16} />
          <span>Consultorio General</span>
        </div>
        <div className={`${styles.detail} ${doctor.slots > 0 ? styles.available : styles.unavailable}`}>
          <Calendar size={16} />
          <span>{doctor.slots} turnos disponibles</span>
        </div>
      </div>

      <div className={styles.footer}>
        <button 
          onClick={handleBook} 
          disabled={doctor.slots === 0 || loading || success}
          className={`${styles.bookBtn} ${success ? styles.successBtn : ''}`}
        >
          {loading ? 'Reservando...' : success ? (
            <span className={styles.successText}><Check size={16} /> ¡Reservado!</span>
          ) : 'Agendar Turno'}
        </button>
      </div>
    </div>
  );
};
