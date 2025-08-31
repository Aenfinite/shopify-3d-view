// Function to get a user-friendly error message from Firebase errors
export function getFirebaseErrorMessage(error: any): string {
  if (!error) {
    return "An unknown error occurred"
  }

  // Handle specific Firebase error codes
  if (error.code) {
    switch (error.code) {
      case "permission-denied":
        return "You don't have permission to access this data. Please check your authentication status."
      case "unavailable":
        return "The Firebase service is currently unavailable. Please check your internet connection."
      case "unauthenticated":
        return "You need to be logged in to perform this action."
      case "resource-exhausted":
        return "Firebase quota has been exceeded. Please try again later."
      case "failed-precondition":
        return "Operation failed due to a precondition failure. Multiple tabs might be open."
      case "unimplemented":
        return "This feature is not supported in your current environment."
      default:
        return error.message || "An error occurred while connecting to Firebase."
    }
  }

  // Handle network errors
  if (error.name === "TypeError" && error.message.includes("NetworkError")) {
    return "Network error. Please check your internet connection."
  }

  // Handle __FIREBASE_DEFAULTS__ error
  if (error.message && error.message.includes("__FIREBASE_DEFAULTS__")) {
    return "Firebase initialization error. This is likely due to a configuration issue."
  }

  // Default error message
  return error.message || "An unknown error occurred"
}

// Function to retry an operation with exponential backoff
export async function retryOperation<T>(operation: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> {
  let lastError: any

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt)

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError
}
