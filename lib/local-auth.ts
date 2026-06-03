// Local auth system — works without Supabase
// Stores users and sessions in localStorage

export interface LocalUser {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

const USERS_KEY = "life-os-users";
const SESSION_KEY = "life-os-session";

function getUsers(): LocalUser[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function saveUsers(users: LocalUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function localSignUp(email: string, password: string, username: string): { user: LocalUser | null; error: string | null } {
  const users = getUsers();
  if (users.find((u) => u.email === email)) {
    return { user: null, error: "Email already registered" };
  }
  const user: LocalUser = {
    id: crypto.randomUUID(),
    email,
    username,
    createdAt: new Date().toISOString(),
  };
  // store password hashed simply (not production-safe, fine for local dev)
  const withPasswords = JSON.parse(localStorage.getItem(USERS_KEY + "-pw") || "[]");
  withPasswords.push({ id: user.id, password });
  localStorage.setItem(USERS_KEY + "-pw", JSON.stringify(withPasswords));
  saveUsers([...users, user]);
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { user, error: null };
}

export function localSignIn(email: string, password: string): { user: LocalUser | null; error: string | null } {
  const users = getUsers();
  const user = users.find((u) => u.email === email);
  if (!user) return { user: null, error: "No account found with this email" };
  const passwords = JSON.parse(localStorage.getItem(USERS_KEY + "-pw") || "[]");
  const match = passwords.find((p: { id: string; password: string }) => p.id === user.id && p.password === password);
  if (!match) return { user: null, error: "Incorrect password" };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { user, error: null };
}

export function localGetUser(): LocalUser | null {
  if (typeof window === "undefined") return null;
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
}

export function localSignOut() {
  localStorage.removeItem(SESSION_KEY);
}
