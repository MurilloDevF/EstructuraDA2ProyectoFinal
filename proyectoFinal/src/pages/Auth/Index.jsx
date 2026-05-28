import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import styles from './Index.module.scss';
import { Activity } from 'lucide-react';

export const Auth = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('patient');
  const [specialty, setSpecialty] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name, role, specialty);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Ocurrió un error. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  const selectedRoleLabel = role === 'doctor' ? 'Médico' : 'Paciente';

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Activity className={styles.logoIcon} size={40} />
          <h1>MediQueue</h1>
          <p>Portal de Gestión Hospitalaria y Emergencias</p>
        </div>

        <div className={styles.tabs}>
          <button 
            type="button" 
            className={`${styles.tab} ${isLogin ? styles.activeTab : ''}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Iniciar Sesión
          </button>
          <button 
            type="button" 
            className={`${styles.tab} ${!isLogin ? styles.activeTab : ''}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Registrarse
          </button>
        </div>

        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #b6e0fe',
          color: '#1e3a8a',
          padding: '0.9rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.95rem'
        }}>
          <strong>Elige tu rol:</strong> pacientes agendan citas, médicos atienden y despachan ambulancias.
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Nombre Completo</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select 
                  className="form-control" 
                  required 
                  value={role} 
                  onChange={(e) => {
                    const nextRole = e.target.value;
                    setRole(nextRole);
                    if (nextRole === 'patient') {
                      setSpecialty('');
                    }
                  }}
                >
                  <option value="patient">Paciente</option>
                  <option value="doctor">Médico</option>
                </select>
              </div>
              {role === 'doctor' && (
                <div className="form-group">
                  <label>Especialidad</label>
                  <select
                    className="form-control"
                    required
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                  >
                    <option value="">Selecciona una especialidad</option>
                    <option value="Cardiología">Cardiología</option>
                    <option value="Pediatría">Pediatría</option>
                    <option value="Neurología">Neurología</option>
                    <option value="Dermatología">Dermatología</option>
                    <option value="Traumatología">Traumatología</option>
                    <option value="General">General</option>
                  </select>
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              className="form-control" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              className="form-control" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Rol seleccionado</label>
              <input
                type="text"
                className="form-control"
                value={selectedRoleLabel}
                disabled
                readOnly
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {loading ? 'Procesando...' : isLogin ? 'Ingresar' : 'Crear Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
};
