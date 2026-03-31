// Firebase removed — debug utilities no longer apply.
export async function checkFirebaseConnection() {
  return { success: false, message: "Firebase not in use" }
}
export async function resetFirebaseConnection() {
  return { success: false, message: "Firebase not in use" }
}
export function getFirebaseConfigInfo() {
  return { firestoreInitialized: false, authInitialized: false, projectId: "n/a", authDomain: "n/a", usingEmulator: false, environment: "n/a" }
}
export async function clearFirebaseCache() {
  return { success: false, message: "Firebase not in use" }
}
