import { createStore } from "./index.js";
import { getCollection, insertItem, deleteItem, updateItem } from "./data/db.js";

const SESSION_KEY = "rms_session";

function getSession() {
  try {
    let raw = localStorage.getItem(SESSION_KEY);
    if (!raw) raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(user, keepSignedIn = true) {
  if (keepSignedIn) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    sessionStorage.removeItem(SESSION_KEY);
  } else {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    localStorage.removeItem(SESSION_KEY);
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

const savedUser = getSession();

const authStore = createStore({
  user: savedUser,
  isAuthenticated: !!savedUser,
  error: null,
});

export async function login(identifier, password, keepSignedIn = true) {
  const users = getCollection("users");
  const lowerId = identifier.toLowerCase();
  const user = users.find(u => 
    u.username.toLowerCase() === lowerId || 
    (u.email && u.email.toLowerCase() === lowerId)
  ); // Fake password check
  
  if (user) {
    const loggedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.full_name || user.username,
      role: user.role,
      is_active: user.is_active !== false,
      createdAt: user.created_at || new Date().toISOString(),
    };
    saveSession(loggedUser, keepSignedIn);
    authStore.setState({
      user: loggedUser,
      isAuthenticated: true,
      error: null,
    });
    return { success: true, user: loggedUser };
  } else {
    const err = "Usuario o contraseña inválidos";
    authStore.setState({ error: err });
    return { success: false, error: err };
  }
}

export function logout() {
  clearSession();
  authStore.setState({ user: null, isAuthenticated: false, error: null });
}

export function currentUser() {
  return authStore.getState().user;
}

export function isAuthenticated() {
  return authStore.getState().isAuthenticated;
}

export function error() {
  return authStore.getState().error;
}

export function clearError() {
  authStore.setState({ error: null });
}

export function hasRole(...roles) {
  const user = authStore.getState().user;
  return user ? roles.includes(user.role) : false;
}

export function canAccess(allowedRoles) {
  const user = authStore.getState().user;
  if (!user) return false;
  if (allowedRoles.includes("*")) return true;
  return allowedRoles.includes(user.role);
}

export function setRole(newRole) {
  const user = authStore.getState().user;
  if (!user) return;
  user.role = newRole;
  authStore.setState({ user: user });
}

export async function addUser(userData) {
  const u = authStore.getState().user;
  if (!u || u.role !== "admin") {
    return { success: false, error: "Solo los administradores pueden crear usuarios" };
  }
  
  const newUser = {
    id: "user-" + Date.now(),
    username: userData.username,
    email: userData.email,
    password: userData.password,
    full_name: userData.full_name || userData.username,
    role: userData.role || "waiter",
    created_at: new Date().toISOString()
  };
  
  insertItem("users", newUser);
  return { success: true, user: newUser };
}

export async function removeUser(userId) {
  try {
    deleteItem("users", userId);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function changeUserRole(userId, newRole) {
  try {
    const user = updateItem("users", userId, { role: newRole });
    return { success: true, user };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function listUsers() {
  const users = getCollection("users");
  return users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    name: u.full_name || u.username,
    role: u.role,
    is_active: u.is_active !== false,
    createdAt: u.created_at,
  }));
}

export function subscribe(listener) {
  return authStore.subscribe(listener);
}

export default {
  login,
  logout,
  currentUser() {
    return currentUser();
  },
  isAuthenticated() {
    return isAuthenticated();
  },
  error() {
    return error();
  },
  clearError,
  hasRole,
  canAccess,
  addUser,
  removeUser,
  changeUserRole,
  listUsers,
  subscribe,
};
