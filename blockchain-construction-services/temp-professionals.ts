// TEMPORARY FILE TO CREATE PROPER PROFESSIONAL DISTRIBUTION
// This will ensure each service category has unique professionals

const professionalsByService = {
  // GARDENING (0) - 5 professionals
  0: [
    { name: "Carlos Mendoza", id: 1 },      // Keep existing
    { name: "Rosa Martinez", id: 30 },      // New
    { name: "Diego Flores", id: 31 },       // New
    { name: "Ana Jardín", id: 32 },         // New
    { name: "Luis Verde", id: 33 },         // New
  ],
  
  // PLUMBING (1) - 5 professionals
  1: [
    { name: "María González", id: 2 },      // Keep existing
    { name: "Fernando Castro", id: 25 },    // Keep existing
    { name: "Pedro Tuberías", id: 34 },     // New
    { name: "Carmen Agua", id: 35 },        // New
    { name: "Roberto Plomo", id: 36 },      // New
  ],
  
  // ELECTRICAL (2) - 5 professionals  
  2: [
    { name: "Miguel Torres", id: 3 },       // Keep existing
    { name: "Andrés Ramírez", id: 23 },     // Keep existing
    { name: "Elena Voltios", id: 37 },      // New
    { name: "Carlos Luz", id: 38 },         // New
    { name: "Sofia Cables", id: 39 },       // New
  ],
  
  // And so on for all 16 service types...
}
