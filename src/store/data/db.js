import { initialData } from "./initialData.js";

const PREFIX = "elfogon_";

export function getCollection(name) {
  const raw = localStorage.getItem(PREFIX + name);
  if (!raw) {
    if (initialData[name]) {
      localStorage.setItem(PREFIX + name, JSON.stringify(initialData[name]));
      return initialData[name];
    }
    return Array.isArray(initialData[name]) ? [] : {};
  }
  return JSON.parse(raw);
}

export function saveCollection(name, data) {
  localStorage.setItem(PREFIX + name, JSON.stringify(data));
}

export function insertItem(collectionName, item) {
  const coll = getCollection(collectionName);
  if (!Array.isArray(coll)) throw new Error(`La colección ${collectionName} no es un arreglo`);
  coll.push(item);
  saveCollection(collectionName, coll);
  return item;
}

export function updateItem(collectionName, id, updates) {
  const coll = getCollection(collectionName);
  if (!Array.isArray(coll)) throw new Error(`La colección ${collectionName} no es un arreglo`);
  const index = coll.findIndex((x) => x.id === id);
  if (index !== -1) {
    coll[index] = { ...coll[index], ...updates };
    saveCollection(collectionName, coll);
    return coll[index];
  }
  return null;
}

export function deleteItem(collectionName, id) {
  const coll = getCollection(collectionName);
  if (!Array.isArray(coll)) throw new Error(`La colección ${collectionName} no es un arreglo`);
  const newColl = coll.filter((x) => x.id !== id);
  saveCollection(collectionName, newColl);
}

export function resetDatabase() {
  Object.keys(initialData).forEach((key) => {
    localStorage.removeItem(PREFIX + key);
  });
  window.location.reload();
}

export function initDb() {
  Object.keys(initialData).forEach((key) => {
    getCollection(key);
  });
}
