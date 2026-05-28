import React, { createContext, useState, useEffect, useMemo } from 'react';
import { dbService, isDemoMode } from '../firebase';
import { Stack } from '../helpers/dataStructures/Stack.js';
import { Queue } from '../helpers/dataStructures/Queue.js';
import { Trie } from '../helpers/dataStructures/Trie.js';
import { MinHeap } from '../helpers/dataStructures/Heap.js';
import { Graph } from '../helpers/dataStructures/Graph.js';

export const HospitalContext = createContext();

export const HospitalProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [consultationsRaw, setConsultationsRaw] = useState([]);
  const [triageRaw, setTriageRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedCollections, setLoadedCollections] = useState({
    doctors: false,
    consultations: false,
    triage: false
  });
  const [doctorsAutoInitialized, setDoctorsAutoInitialized] = useState(false);
  const [realtimeDataSeeded, setRealtimeDataSeeded] = useState(false);
  
  // Custom Stack for local view history
  const [historyStack] = useState(() => new Stack());
  const [currentHistoryView, setCurrentHistoryView] = useState([]);

  const markCollectionLoaded = (collectionName) => {
    setLoadedCollections((prev) => {
      const next = {
        ...prev,
        [collectionName]: true
      };
      if (Object.values(next).every(Boolean)) {
        setLoading(false);
      }
      return next;
    });
  };

  // Load real-time data from Firestore/LocalStorage
  useEffect(() => {
    const unsubDoctors = dbService.subscribeToCollection(
      "doctors",
      (data) => {
        setError(null);
        setDoctors(data);
        markCollectionLoaded("doctors");
      },
      (error) => {
        console.error("Error al cargar médicos:", error);
        setError("No se pudo cargar los médicos. Verifica la conexión y las reglas de Firestore.");
        markCollectionLoaded("doctors");
      }
    );

    const unsubConsultations = dbService.subscribeToCollection(
      "consultations",
      (data) => {
        setError(null);
        setConsultationsRaw(data);
        markCollectionLoaded("consultations");
      },
      (error) => {
        console.error("Error al cargar consultas:", error);
        setError("No se pudo cargar las consultas. Verifica la conexión y las reglas de Firestore.");
        markCollectionLoaded("consultations");
      }
    );

    const unsubTriage = dbService.subscribeToCollection(
      "triage",
      (data) => {
        setError(null);
        setTriageRaw(data);
        markCollectionLoaded("triage");
      },
      (error) => {
        console.error("Error al cargar triage:", error);
        setError("No se pudo cargar las urgencias. Verifica la conexión y las reglas de Firestore.");
        markCollectionLoaded("triage");
      }
    );

    return () => {
      unsubDoctors();
      unsubConsultations();
      unsubTriage();
    };
  }, []);

  useEffect(() => {
    if (!isDemoMode && !realtimeDataSeeded) {
      setRealtimeDataSeeded(true);
      dbService.seedRealtimeData().catch((error) => {
        console.error('No se pudieron inicializar los datos en tiempo real:', error);
      });
    }
  }, [realtimeDataSeeded]);

  useEffect(() => {
    if (!isDemoMode && loadedCollections.doctors && doctors.length === 0 && !doctorsAutoInitialized) {
      setDoctorsAutoInitialized(true);
      dbService.initializeDoctors().catch((error) => {
        console.error('No se pudieron inicializar los médicos automáticamente:', error);
      });
    }
  }, [doctors, loadedCollections.doctors, doctorsAutoInitialized]);

  // 1. Trie for doctor and specialty autocomplete search
  const searchTrie = useMemo(() => {
    const trie = new Trie();
    doctors.forEach(doc => {
      trie.insert(doc.name, doc);
      trie.insert(doc.specialty, doc);
      // Index words separately
      doc.name.split(" ").forEach(word => {
        if (word.length > 2) trie.insert(word, doc);
      });
    });
    return trie;
  }, [doctors]);

  // 2. Queue for general practitioner appointments (FIFO)
  const generalQueue = useMemo(() => {
    const q = new Queue();
    // Sort raw elements to guarantee chronological ordering
    const active = consultationsRaw.filter(c => c.status === "waiting");
    const sorted = [...active].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    sorted.forEach(c => q.enqueue(c));
    return q;
  }, [consultationsRaw]);

  // 3. Min-Heap for emergency triage priority queue
  const triageHeap = useMemo(() => {
    const heap = new MinHeap();
    const active = triageRaw.filter(t => t.status === "waiting");
    active.forEach(t => {
      heap.insert(t, t.priority);
    });
    return heap;
  }, [triageRaw]);

  // 4. Graph representing medical center zones and ambulance depots
  const cityGraph = useMemo(() => {
    const g = new Graph();
    // Hospital and medical stations
    g.addVertex("Hospital General", { lat: 6.2442, lng: -75.5712 });
    g.addVertex("Estación Norte", { lat: 6.2642, lng: -75.5612 });
    g.addVertex("Estación Sur", { lat: 6.2242, lng: -75.5812 });
    
    // Neighborhood / residential patient zones
    g.addVertex("Zona Residencial A", { lat: 6.2542, lng: -75.5862 });
    g.addVertex("Zona Comercial B", { lat: 6.2342, lng: -75.5562 });
    g.addVertex("Zona Industrial C", { lat: 6.2142, lng: -75.5662 });
    g.addVertex("Urbanización D", { lat: 6.2742, lng: -75.5762 });

    // Connections (distance/times as edge weights in minutes)
    g.addEdge("Hospital General", "Estación Norte", 5);
    g.addEdge("Hospital General", "Estación Sur", 6);
    g.addEdge("Estación Norte", "Urbanización D", 4);
    g.addEdge("Estación Norte", "Zona Residencial A", 7);
    g.addEdge("Estación Sur", "Zona Residencial A", 5);
    g.addEdge("Estación Sur", "Zona Industrial C", 4);
    g.addEdge("Zona Residencial A", "Urbanización D", 3);
    g.addEdge("Zona Residencial A", "Zona Comercial B", 8);
    g.addEdge("Hospital General", "Zona Comercial B", 4);
    g.addEdge("Zona Comercial B", "Zona Industrial C", 6);
    
    return g;
  }, []);

  // Navigation / Doctor view history stack manager
  const pushToHistory = (patientRecord) => {
    historyStack.push(patientRecord);
    setCurrentHistoryView(historyStack.toArray());
  };

  const popFromHistory = () => {
    const popped = historyStack.pop();
    setCurrentHistoryView(historyStack.toArray());
    return popped;
  };

  const clearHistory = () => {
    historyStack.clear();
    setCurrentHistoryView([]);
  };

  // CRUD Actions
  const registerGeneralConsultation = async (patientName, reason) => {
    await dbService.addDocument("consultations", {
      patientName,
      reason,
      status: "waiting"
    });
  };

  const registerEmergency = async (patientName, location, severity, priority) => {
    await dbService.addDocument("triage", {
      patientName,
      location,
      severity,
      priority,
      status: "waiting"
    });
  };

  const resolveFirstConsultation = async () => {
    const first = generalQueue.peek();
    if (first) {
      await dbService.updateDocument("consultations", first.id, { status: "resolved" });
    }
  };

  const resolveHighestTriage = async () => {
    const highest = triageHeap.peek();
    if (highest) {
      await dbService.updateDocument("triage", highest.id, { status: "resolved" });
    }
  };

  const bookDoctorAppointment = async (doctorId, patientName) => {
    await dbService.bookDoctorSlot(doctorId);
    await dbService.addDocument("appointments", {
      doctorId,
      patientName,
      date: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString()
    });
  };

  const value = {
    doctors,
    searchTrie,
    generalQueue,
    triageHeap,
    cityGraph,
    currentHistoryView,
    pushToHistory,
    popFromHistory,
    clearHistory,
    registerGeneralConsultation,
    registerEmergency,
    resolveFirstConsultation,
    resolveHighestTriage,
    bookDoctorAppointment,
    loading,
    error
  };

  return (
    <HospitalContext.Provider value={value}>
      {children}
    </HospitalContext.Provider>
  );
};
