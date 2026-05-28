import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Menu.module.scss';
import { Activity, LogOut, MessageSquare, MapPin, User, LayoutDashboard } from 'lucide-react';

export const Menu = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <Activity size={24} className={styles.logoIcon} />
          <span>MediQueue</span>
        </Link>

        {currentUser && (
          <div className={styles.navLinks}>
            {currentUser.role === 'doctor' ? (
              <>
                <Link to="/" className={styles.navLink}>
                  <LayoutDashboard size={18} />
                  <span>Dashboard Médico</span>
                </Link>
                <Link to="/chat" className={styles.navLink}>
                  <MessageSquare size={18} />
                  <span>Chat con Pacientes</span>
                </Link>
                <Link to="/map" className={styles.navLink}>
                  <MapPin size={18} />
                  <span>Despacho Ambulancias</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className={styles.navLink}>
                  <User size={18} />
                  <span>Portal Paciente</span>
                </Link>
                <Link to="/chat" className={styles.navLink}>
                  <MessageSquare size={18} />
                  <span>Chat de Soporte</span>
                </Link>
                <Link to="/map" className={styles.navLink}>
                  <MapPin size={18} />
                  <span>Rutas de Emergencia</span>
                </Link>
              </>
            )}

            <div className={styles.userInfo}>
              <span className={styles.userName}>{currentUser.name}</span>
              <span className={styles.userRole}>{currentUser.role === 'doctor' ? 'Médico' : 'Paciente'}</span>
            </div>

            <button onClick={handleLogout} className={styles.logoutBtn} title="Cerrar Sesión">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
