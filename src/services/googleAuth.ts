import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Reuse existing Firebase app instance if already initialized
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const GOOGLE_CLOUD_PROJECT_ID = firebaseConfig.projectId || 'gen-lang-client-0353653177';
export const GOOGLE_CLOUD_CONSENT_URL = `https://console.cloud.google.com/apis/credentials/consent?project=${GOOGLE_CLOUD_PROJECT_ID}`;

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory token cache (never stored in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface AuthErrorInfo {
  title: string;
  message: string;
  isAccessDenied: boolean;
  isClosedByUser: boolean;
  isPopupBlocked: boolean;
  cloudUrl: string;
}

export function parseAuthError(error: unknown): AuthErrorInfo {
  const err = error as { code?: string; message?: string } | null;
  const code = err?.code || '';
  const msg = err?.message || '';

  const isClosedByUser = code === 'auth/popup-closed-by-user' || msg.includes('popup-closed-by-user');
  const isAccessDenied = msg.includes('access_denied') || msg.includes('403') || code === 'auth/access_denied';
  const isPopupBlocked = code === 'auth/popup-blocked' || msg.includes('popup-blocked');

  if (isClosedByUser) {
    return {
      title: 'Ventana de Google Cerrada',
      message: 'La ventana emergente se cerró antes de otorgar los permisos. Si viste una pantalla roja con "Error 403: access_denied", significa que la cuenta de Google necesita ser registrada como Usuario de Prueba en la consola de Google Cloud, o puedes utilizar el método de Exportación Directa a CSV.',
      isAccessDenied: true,
      isClosedByUser: true,
      isPopupBlocked: false,
      cloudUrl: GOOGLE_CLOUD_CONSENT_URL,
    };
  }

  if (isAccessDenied) {
    return {
      title: 'Acceso Denegado (Error 403: access_denied)',
      message: `Google Cloud mantiene la aplicación en "Modo de Prueba". Para permitir el inicio de sesión oficial con tu cuenta (ej. olmopez71@gmail.com), debes agregarla como "Usuario de prueba" (Test User) en la pantalla de consentimiento de Google Cloud Console del proyecto ${GOOGLE_CLOUD_PROJECT_ID}.`,
      isAccessDenied: true,
      isClosedByUser: false,
      isPopupBlocked: false,
      cloudUrl: GOOGLE_CLOUD_CONSENT_URL,
    };
  }

  if (isPopupBlocked) {
    return {
      title: 'Ventana Emergente Bloqueada',
      message: 'El navegador bloqueó la ventana emergente de Google. Por favor autoriza los pop-ups para esta página e intenta de nuevo.',
      isAccessDenied: false,
      isClosedByUser: false,
      isPopupBlocked: true,
      cloudUrl: GOOGLE_CLOUD_CONSENT_URL,
    };
  }

  return {
    title: 'Error de Autenticación con Google',
    message: msg || 'No se pudo completar la conexión con los servicios de Google.',
    isAccessDenied: false,
    isClosedByUser: false,
    isPopupBlocked: false,
    cloudUrl: GOOGLE_CLOUD_CONSENT_URL,
  };
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token might need a fresh sign-in if expired/cleared
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: unknown) {
    console.warn('Error capturado en googleSignIn:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setManualAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const logout = async () => {
  try {
    await signOut(auth);
  } finally {
    cachedAccessToken = null;
  }
};
