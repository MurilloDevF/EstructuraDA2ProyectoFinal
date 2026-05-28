import React, { useState, useContext, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { HospitalContext } from '../../context/HospitalContext';
import styles from './Index.module.scss';
import { Navigation, Route, Clock } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix standard marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom markers for Map
const hospitalIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/809/809988.png', 
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const stationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', 
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const zoneIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1865/1865269.png', 
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

export const MapPage = () => {
  const { cityGraph } = useContext(HospitalContext);

  const [startNode, setStartNode] = useState('Hospital General');
  const [endNode, setEndNode] = useState('Urbanización D');
  const [routeInfo, setRouteInfo] = useState(null);

  // Read all graph vertices
  const nodesList = useMemo(() => {
    return Object.keys(cityGraph.adjacencyList);
  }, [cityGraph]);

  const handleCalculateRoute = () => {
    if (startNode === endNode) {
      alert("El origen y destino no pueden ser el mismo.");
      return;
    }
    const result = cityGraph.getShortestPath(startNode, endNode);
    setRouteInfo(result);
  };

  // Convert Dijkstra path nodes to coordinate array [lat, lng]
  const polylineCoords = useMemo(() => {
    if (!routeInfo || !routeInfo.path.length) return [];
    return routeInfo.path.map(node => {
      const coords = cityGraph.getCoordinates(node);
      return [coords.lat, coords.lng];
    });
  }, [routeInfo, cityGraph]);

  return (
    <div className="container">
      <div className={styles.layout}>
        {/* Sidebar Controls */}
        <div className={styles.sidebar}>
          <div className="card">
            <h3 className={styles.title}>
              <Navigation className={styles.titleIcon} size={22} />
              Despacho de Ambulancia
            </h3>
            <p className={styles.desc}>
              Selecciona el punto de partida (Hospital/Estaciones) y la zona de emergencia del paciente para calcular la ruta más rápida.
            </p>

            <div className="form-group">
              <label>Origen (Ambulancia / Punto de Salida)</label>
              <select 
                className="form-control" 
                value={startNode} 
                onChange={(e) => { setStartNode(e.target.value); setRouteInfo(null); }}
              >
                {nodesList.map(node => (
                  <option key={node} value={node}>{node}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Destino (Zona del Paciente)</label>
              <select 
                className="form-control" 
                value={endNode} 
                onChange={(e) => { setEndNode(e.target.value); setRouteInfo(null); }}
              >
                {nodesList.map(node => (
                  <option key={node} value={node}>{node}</option>
                ))}
              </select>
            </div>

            <button onClick={handleCalculateRoute} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Calcular Ruta Óptima
            </button>

            {routeInfo && routeInfo.path.length > 0 && (
              <div className={styles.routeResult}>
                <h4 className={styles.resultTitle}>
                  <Route size={18} />
                  Ruta Calculada (Dijkstra)
                </h4>
                
                <div className={styles.pathSteps}>
                  {routeInfo.path.map((step, idx) => (
                    <div key={step} className={styles.step}>
                      <span className={styles.stepNum}>{idx + 1}</span>
                      <span className={styles.stepName}>{step}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.timeInfo}>
                  <Clock size={16} />
                  <span>Tiempo estimado de llegada: <strong>{routeInfo.distance} minutos</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map View */}
        <div className={styles.mapContainer}>
          <MapContainer 
            center={[6.2442, -75.5712]} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Draw nodes as markers */}
            {nodesList.map(nodeName => {
              const coords = cityGraph.getCoordinates(nodeName);
              if (!coords) return null;

              let icon = zoneIcon;
              if (nodeName === "Hospital General") icon = hospitalIcon;
              else if (nodeName.startsWith("Estación")) icon = stationIcon;

              return (
                <Marker 
                  key={nodeName} 
                  position={[coords.lat, coords.lng]} 
                  icon={icon}
                >
                  <Popup>
                    <strong>{nodeName}</strong> <br />
                    Lat: {coords.lat}, Lng: {coords.lng}
                  </Popup>
                </Marker>
              );
            })}

            {/* Draw Dijkstra path polyline */}
            {polylineCoords.length > 0 && (
              <Polyline 
                positions={polylineCoords} 
                color="#c53030" 
                weight={5} 
                opacity={0.85}
                dashArray="10, 10"
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};
