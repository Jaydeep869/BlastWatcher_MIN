const admin = require('firebase-admin');

// Firebase Admin SDK service account key
const serviceAccount = {
  type: "service_account",
  project_id: "mineblast869",
  private_key_id: "7b934fde721277b983672fd112a63cc5803876fa",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCwav1dqt9YKNpG\nEIpOVn2yCXtHMJdPRVBwXaBPTZNKG+ohe743K7Dlo+ov11ZeeQ5sD/MPxrjIj0Qh\nqIskHCL5RjvCaTO4OjVUs4KIEK9jOXzRKbKWadF3v88Y5WPgMBTeEcagc7Z4MHZr\n7RgCCubbZYKSYZ54e9jZG62K+5dboDDX6nQ4xGpiPAgZQV/HwWDlC1pjjHQd3oR2\n/BiROoNaZIdcIwpUz2SqR6v1IwYZaIpduZfkMyMl+pbqk5rwkI5wSmmt9TQOtQU4\n8RZj7p8D30OfeVUEa5dmv5RZ0ZnCTmLTNcqwozRzlqwBL2mxzE8hZiJjtqQQbMIa\npATarBlxAgMBAAECggEABVxX6vpp715s7Ql8QWeDiecbutDfPSx5lnOC3zwHym4F\nGBu/7sJeLYk0wNvH0ya1rWsR50giJe6ECwuJgFk2Rxm3L8f1d071/0cV46Nxp+fH\nmx27sHJCWCOhA/Q2++lMHggfX3FqsVXkKFEH3GqHQ7IOxNrQZ1/4ibbbh/RPj+w2\nGtcrScxzFRnykMWJqTQNm6ujvU+7EVkCx6yNS0Xpc5UqcfBqnELQAKO2W2y5bDwy\nfWZ5lO8KWQeGu0nfbSY3kvTvbm99dkTD3vGMRKppEp+srH9VRE+1a+EEOl1CaIJU\nnD/O/DzhzD7tdKmfav7hU/MrVP40UfQU11RUPcgBYQKBgQDYdjtiF0nFzMSE8FHH\nI0MxEbK98/EvTpuPXfOZFPzU/Odooejgi8sFdYRugxakBjooCWCjb1EvmOSFL5Fy\nEJNNMKbAV3Q3K5Ys6XwHpfPGl4MnBPlnBMYp8wNCW9PsZLtvCzm4hR8lqFJ9Wu1p\nVruMSsO6FKTL6+Olxsf1BSjeUQKBgQDQpE1Q2fdqk7Yko6HKsq+v10yipRI7ywBR\n3P9oO27hBdORCx6GzPzqC/HEhKtvgXAXtaP5cQzyibASOGVZS6G6/t1jDbTMfKL8\nHfGUX/hz4F5rZhtF3kpgPYT7TuxLwNUZpSRRN80qjW/Qsx5sOfUjLTajUyNylW54\njMDfVQ8hIQKBgGgFeUgMNPGPE6lm64WtFm8QODs8bVz0g6ED3zpjcZTQ7EvF8ull\nhGzdKoUJDepI682to/kmV3duG/M9BsIv4PmpNZkc7cZNdd+jXG04fMukp+wqYcf1\n7VzfYWOUSWVCiygz1ssrfepU1z9SYODMQ1iJ3UEhBojQlRdnTVQb5KXhAoGBAJST\nzHM9JRICan0hAcBlCvN/sJVKU/e8kle5tzA00rrv+T+a2XxJUfoh02OMzsCzPm3D\n7ideOEgngPkYrCOw1lVh1aoKQqw0PaSodjahOT7bkqGMrvNMX061wJNuGpu/kIGY\ntooX4MTiv7OxOoL7qvQH6JbaR637eBXkthzUZ9fBAoGAEnmd/A2Xm29VLVmOKA9B\nxKjgsSaaKyg+2NOeRMDOJB9zJTMhsABHCK9MlCq2c4SsX8N7PFfsh6vlR054M5Ax\nAky9NXXHoOxsxt0Dr0eHuH14eM0RZ/OVhWjJQ/XvPsx0c1hj3kbr+XybMyxpOOmT\nJuGu5xVwgcVJyl6FiGj3D54=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@mineblast869.iam.gserviceaccount.com",
  client_id: "110453784931817840797",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40mineblast869.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Initialize Firebase Admin
const initializeFirebase = () => {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'mineblast869'
      });
      console.log('🔥 Firebase Admin initialized successfully');
    }
    return admin;
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    throw error;
  }
};

// Verify Firebase token
const verifyFirebaseToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Firebase token verification error:', error);
    throw error;
  }
};

// Get Firebase user data
const getFirebaseUser = async (uid) => {
  try {
    const userRecord = await admin.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('Firebase get user error:', error);
    throw error;
  }
};

module.exports = {
  initializeFirebase,
  verifyFirebaseToken,
  getFirebaseUser,
  admin
};
