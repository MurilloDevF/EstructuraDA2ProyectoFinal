import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  addDoc, 
  onSnapshot, 
  updateDoc, 
  runTransaction 
} from "firebase/firestore";

// Configuración de Firebase (desde variables de entorno)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Verifica si las credenciales están configuradas
const isRealFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "" && 
  !firebaseConfig.apiKey.includes("YOUR_API_KEY");

let app;
let realAuth = null;
let realDb = null;
let isDemoMode = false;

if (isRealFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    realAuth = getAuth(app);
    realDb = getFirestore(app);
    console.log("MediQueue: Conectado a Firebase real.");
  } catch (error) {
    console.error("MediQueue: Falló la inicialización de Firebase, entrando en Modo Demo:", error);
    isDemoMode = true;
  }
} else {
  console.log("MediQueue: No se encontró configuración de Firebase. Ejecutando en Modo Demo Local.");
  isDemoMode = true;
}

// ==========================================
// EMULADOR EN MODO DEMO LOCAL (basado en localStorage)
// ==========================================
class DemoAuth {
  constructor() {
    this.listeners = [];
    this.currentUser = JSON.parse(localStorage.getItem("mediqueue_user")) || null;
    
    // Autocrear doctor de demostración estándar si no existe
    const users = JSON.parse(localStorage.getItem("mediqueue_users")) || [];
    if (!users.some(u => u.email === "doctor@mediqueue.com")) {
      users.push({
        uid: "doctor123",
        email: "doctor@mediqueue.com",
        password: "password123",
        name: "Dr. Carlos Mendoza",
        role: "doctor",
        specialty: "Cardiología"
      });
      localStorage.setItem("mediqueue_users", JSON.stringify(users));
    }
  }

  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  async createUserWithEmailAndPassword(email, password, name, role = "patient", specialty = "") {
    const users = JSON.parse(localStorage.getItem("mediqueue_users")) || [];
    if (users.some(u => u.email === email)) {
      throw new Error("El correo ya está registrado.");
    }
    const newUser = {
      uid: "uid_" + Math.random().toString(36).substr(2, 9),
      email,
      password,
      name,
      role,
      specialty
    };
    users.push(newUser);
    localStorage.setItem("mediqueue_users", JSON.stringify(users));
    
    this.currentUser = { uid: newUser.uid, email: newUser.email, name: newUser.name, role: newUser.role, specialty: newUser.specialty };
    localStorage.setItem("mediqueue_user", JSON.stringify(this.currentUser));
    this.triggerListeners();
    return { user: this.currentUser };
  }

  async signInWithEmailAndPassword(email, password) {
    const users = JSON.parse(localStorage.getItem("mediqueue_users")) || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error("Usuario o contraseña incorrectos.");
    }
    this.currentUser = { uid: user.uid, email: user.email, name: user.name, role: user.role, specialty: user.specialty };
    localStorage.setItem("mediqueue_user", JSON.stringify(this.currentUser));
    this.triggerListeners();
    return { user: this.currentUser };
  }

  async signOut() {
    this.currentUser = null;
    localStorage.removeItem("mediqueue_user");
    this.triggerListeners();
  }

  triggerListeners() {
    this.listeners.forEach(l => l(this.currentUser));
  }
}

class DemoFirestore {
  constructor() {
    this.listeners = {};
    
    // Setup initial doctors in database if empty
    const doctors = JSON.parse(localStorage.getItem("mediqueue_db_doctors"));
    if (!doctors) {
      localStorage.setItem("mediqueue_db_doctors", JSON.stringify([
        { id: "d1", name: "Dr. Carlos Mendoza", specialty: "Cardiología", slots: 3 },
        { id: "d2", name: "Dr. Sofía Restrepo", specialty: "Pediatría", slots: 5 },
        { id: "d3", name: "Dr. Alejandro Ruiz", specialty: "Neurología", slots: 2 },
        { id: "d4", name: "Dra. Mariana Gómez", specialty: "Dermatología", slots: 4 },
        { id: "d5", name: "Dr. Esteban Silva", specialty: "Cardiología", slots: 1 }
      ]));
    }

    // Setup initial queues in database if empty
    if (!localStorage.getItem("mediqueue_db_consultations")) {
      localStorage.setItem("mediqueue_db_consultations", JSON.stringify([]));
    }
    if (!localStorage.getItem("mediqueue_db_triage")) {
      localStorage.setItem("mediqueue_db_triage", JSON.stringify([]));
    }
    if (!localStorage.getItem("mediqueue_db_chat")) {
      localStorage.setItem("mediqueue_db_chat", JSON.stringify([]));
    }
  }

  // Escucha cambios en tiempo real
  onSnapshot(collectionName, callback) {
    if (!this.listeners[collectionName]) {
      this.listeners[collectionName] = [];
    }
    this.listeners[collectionName].push(callback);

    // Initial trigger
    const data = JSON.parse(localStorage.getItem("mediqueue_db_" + collectionName)) || [];
    callback(data);

    // Devuelve función para cancelar la suscripción
    return () => {
      this.listeners[collectionName] = this.listeners[collectionName].filter(l => l !== callback);
    };
  }

  async addDoc(collectionName, data) {
    const key = "mediqueue_db_" + collectionName;
    const currentData = JSON.parse(localStorage.getItem(key)) || [];
    const newDoc = { id: "doc_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5), ...data, createdAt: new Date().toISOString() };
    currentData.push(newDoc);
    localStorage.setItem(key, JSON.stringify(currentData));
    this.triggerListeners(collectionName, currentData);
    return newDoc;
  }

  async setDoc(collectionName, id, data) {
    const key = "mediqueue_db_" + collectionName;
    let currentData = JSON.parse(localStorage.getItem(key)) || [];
    const index = currentData.findIndex(item => item.id === id);
    const updatedDoc = { id, ...data };
    if (index !== -1) {
      currentData[index] = updatedDoc;
    } else {
      currentData.push(updatedDoc);
    }
    localStorage.setItem(key, JSON.stringify(currentData));
    this.triggerListeners(collectionName, currentData);
  }

  async updateDoc(collectionName, id, updatedFields) {
    const key = "mediqueue_db_" + collectionName;
    let currentData = JSON.parse(localStorage.getItem(key)) || [];
    const index = currentData.findIndex(item => item.id === id);
    if (index !== -1) {
      currentData[index] = { ...currentData[index], ...updatedFields };
      localStorage.setItem(key, JSON.stringify(currentData));
      this.triggerListeners(collectionName, currentData);
    }
  }

  // Emulador de transacción de base de datos
  async runTransaction(collectionName, docId, callback) {
    const key = "mediqueue_db_" + collectionName;
    const currentData = JSON.parse(localStorage.getItem(key)) || [];
    const docIndex = currentData.findIndex(item => item.id === docId);
    if (docIndex === -1) throw new Error("Documento no encontrado");

    // Leer documento
    const docData = { ...currentData[docIndex] };
    
    // Execute callback with document data
    const updatedData = callback(docData);
    if (updatedData) {
      currentData[docIndex] = { ...docData, ...updatedData };
      localStorage.setItem(key, JSON.stringify(currentData));
      this.triggerListeners(collectionName, currentData);
    }
  }

  triggerListeners(collectionName, data) {
    if (this.listeners[collectionName]) {
      this.listeners[collectionName].forEach(callback => callback(data));
    }
  }
}

const demoAuth = new DemoAuth();

// Exportar funciones de autenticación
export { isDemoMode };

export const authService = {
  createUser: async (email, password, name, role, specialty) => {
    if (isDemoMode) {
      return demoAuth.createUserWithEmailAndPassword(email, password, name, role, specialty);
    }
    const userCredential = await createUserWithEmailAndPassword(realAuth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    // Write additional profile to Firestore
    const userProfile = {
      uid: userCredential.user.uid,
      email,
      name,
      role: role || "patient",
      specialty: specialty || ""
    };
    await setDoc(doc(realDb, "users", userCredential.user.uid), userProfile);

    // Si es doctor, crear también en la colección 'doctors' para el buscador
    if ((role || "patient").toLowerCase() === "doctor") {
      await setDoc(doc(realDb, "doctors", userCredential.user.uid), {
        name,
        specialty: specialty || "General",
        slots: 3 // valor inicial, puedes ajustar
      });
    }
    return userCredential;
  },

  login: async (email, password) => {
    if (isDemoMode) {
      return demoAuth.signInWithEmailAndPassword(email, password);
    }
    return signInWithEmailAndPassword(realAuth, email, password);
  },

  logout: async () => {
    if (isDemoMode) {
      return demoAuth.signOut();
    }
    return signOut(realAuth);
  },

  subscribeToAuthState: (callback) => {
    if (isDemoMode) {
      return demoAuth.onAuthStateChanged(callback);
    }

    const loadProfile = async (firebaseUser, retries = 0) => {
      try {
        const userDoc = await getDoc(doc(realDb, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          callback({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: data.name || firebaseUser.displayName || firebaseUser.email,
            role: String(data.role || "patient").trim().toLowerCase(),
            specialty: String(data.specialty || "").trim()
          });
          return;
        }

        if (retries < 2) {
          console.warn(`Perfil de usuario no encontrado, reintentando (${retries + 1})...`);
          await new Promise(resolve => setTimeout(resolve, 400));
          return loadProfile(firebaseUser, retries + 1);
        }

        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email,
          role: "patient",
          specialty: ""
        });
      } catch (error) {
        console.error("Firebase getDoc failed, usando datos de auth:", error);
        if (retries < 2) {
          await new Promise(resolve => setTimeout(resolve, 400));
          return loadProfile(firebaseUser, retries + 1);
        }
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email,
          role: "patient",
          specialty: ""
        });
      }
    };

    return onAuthStateChanged(realAuth, async (firebaseUser) => {
      if (firebaseUser) {
        await loadProfile(firebaseUser);
      } else {
        callback(null);
      }
    });
  }
};

// Exportar funciones de base de datos
const demoFirestore = new DemoFirestore();
export const dbService = {
  subscribeToCollection: (collectionName, callback, errorCallback) => {
    if (isDemoMode) {
      return demoFirestore.onSnapshot(collectionName, callback);
    }
    return onSnapshot(
      collection(realDb, collectionName),
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(docs);
      },
      (error) => {
        console.error(`Error subscribing to ${collectionName}:`, error);
        if (typeof errorCallback === 'function') {
          errorCallback(error);
        }
      }
    );
  },

  addDocument: async (collectionName, data) => {
    if (isDemoMode) {
      return demoFirestore.addDoc(collectionName, data);
    }
    return addDoc(collection(realDb, collectionName), {
      ...data,
      createdAt: new Date().toISOString()
    });
  },


  updateDocument: async (collectionName, id, data) => {
    if (isDemoMode) {
      return demoFirestore.updateDoc(collectionName, id, data);
    }
    return updateDoc(doc(realDb, collectionName, id), data);
  },

  // Transacción atómica para reservar turno
  bookDoctorSlot: async (doctorId) => {
    if (isDemoMode) {
      return demoFirestore.runTransaction("doctors", doctorId, (doctor) => {
        if (doctor.slots > 0) {
          doctor.slots -= 1;
          return { slots: doctor.slots };
        } else {
          throw new Error("No hay turnos disponibles para este doctor.");
        }
      });
    }

    const doctorDocRef = doc(realDb, "doctors", doctorId);
    return runTransaction(realDb, async (transaction) => {
      const sfDoc = await transaction.get(doctorDocRef);
      if (!sfDoc.exists()) {
        throw new Error("El doctor no existe en la base de datos.");
      }
      const newSlots = sfDoc.data().slots - 1;
      if (newSlots >= 0) {
        transaction.update(doctorDocRef, { slots: newSlots });
      } else {
        throw new Error("No hay turnos disponibles para este doctor.");
      }
    });
  },

  // Inicializar médicos en Firestore si la colección está vacía
  initializeDoctors: async () => {
    if (isDemoMode) {
      console.log("Modo demo: doctors ya están en localStorage");
      return { success: true, message: "Médicos ya están inicializados en modo local" };
    }

    try {
      const doctorsRef = collection(realDb, "doctors");
      const snapshot = await getDocs(doctorsRef);
      const existingIds = snapshot.docs.map(doc => doc.id);

      const doctors = [
        { id: "d1", name: "Dr. Carlos Mendoza", specialty: "Cardiología", slots: 3 },
        { id: "d2", name: "Dr. Sofía Restrepo", specialty: "Pediatría", slots: 5 },
        { id: "d3", name: "Dr. Alejandro Ruiz", specialty: "Neurología", slots: 2 },
        { id: "d4", name: "Dra. Mariana Gómez", specialty: "Dermatología", slots: 4 },
        { id: "d5", name: "Dr. Esteban Silva", specialty: "Cardiología", slots: 1 }
      ];

      const missingDoctors = doctors.filter((doctor) => !existingIds.includes(doctor.id));
      if (missingDoctors.length === 0) {
        return { success: false, message: "Todos los médicos ya están registrados en Firestore" };
      }

      for (const doctor of missingDoctors) {
        await setDoc(doc(realDb, "doctors", doctor.id), {
          name: doctor.name,
          specialty: doctor.specialty,
          slots: doctor.slots
        });
      }

      return { success: true, message: `${missingDoctors.length} médico(s) agregados correctamente en Firestore` };
    } catch (error) {
      console.error("Error inicializando médicos:", error);
      throw new Error("No se pudieron inicializar los médicos", { cause: error });
    }
  },

  seedRealtimeData: async () => {
    if (isDemoMode) {
      console.log("Modo demo: los datos en tiempo real ya están en localStorage");
      return { success: true, message: "Datos en tiempo real ya inicializados en modo local" };
    }

    try {
      const seedResults = [];

      const doctorsSeed = [
        { id: "d1", name: "Dr. Carlos Mendoza", specialty: "Cardiología", slots: 3 },
        { id: "d2", name: "Dr. Sofía Restrepo", specialty: "Pediatría", slots: 5 },
        { id: "d3", name: "Dr. Alejandro Ruiz", specialty: "Neurología", slots: 2 },
        { id: "d4", name: "Dra. Mariana Gómez", specialty: "Dermatología", slots: 4 },
        { id: "d5", name: "Dr. Esteban Silva", specialty: "Cardiología", slots: 1 }
      ];

      const consultationsSeed = [
        {
          id: "sample-consultation-1",
          patientName: "Mateo Valenzuela",
          reason: "Dolor de cabeza y fiebre ligera",
          status: "waiting",
          createdAt: new Date().toISOString()
        }
      ];

      const triageSeed = [
        {
          id: "sample-triage-1",
          patientName: "Lucía Fernández",
          location: "Zona Residencial A",
          severity: "Fiebre alta",
          priority: 1,
          status: "waiting",
          createdAt: new Date().toISOString()
        }
      ];

      const chatSeed = [
        {
          id: "sample-chat-1",
          chatId: "emergency_general",
          senderName: "Soporte Médico",
          senderId: "system",
          text: "Bienvenido al canal de soporte. Envia tu consulta para comenzar.",
          createdAt: new Date().toISOString()
        }
      ];

      const seedCollection = async (collectionName, documents, idField = "id") => {
        const snapshot = await getDocs(collection(realDb, collectionName));
        if (!snapshot.empty) {
          return;
        }

        for (const document of documents) {
          const { [idField]: docId, ...data } = document;
          await setDoc(doc(realDb, collectionName, docId), data);
        }
      };

      await seedCollection("doctors", doctorsSeed);
      await seedCollection("consultations", consultationsSeed);
      await seedCollection("triage", triageSeed);
      await seedCollection("chat", chatSeed);

      seedResults.push("Datos de Firestore inicializados");
      return { success: true, message: seedResults.join(" | ") };
    } catch (error) {
      console.error("Error inicializando datos de Firestore:", error);
      throw new Error("No se pudieron inicializar los datos de Firestore", { cause: error });
    }
  }
};
