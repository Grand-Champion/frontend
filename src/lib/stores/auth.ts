import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type UserRole = 'admin' | 'manager' | 'gardener';

// Admin key for changing admin password
export const ADMIN_KEY = 'A9f!3Lq2$W7n#K8sR1p&Z4m?Tb6Jx9Gv5Hc0YdQeMu';

export interface User {
    id: string;
    username: string;
    fullName: string;
    password: string;
    role: UserRole;
    createdAt: string;
    createdBy?: string;
}

export interface AuthState {
    currentUser: User | null;
    users: User[];
}

const defaultAdmin: User = {
    id: 'admin-1',
    username: 'admin',
    fullName: 'Administrator',
    password: 'admin',
    role: 'admin',
    createdAt: new Date().toISOString()
};

const storedAuth = browser ? localStorage.getItem('auth') : null;
const initialAuth: AuthState = storedAuth
    ? JSON.parse(storedAuth)
    : { currentUser: null, users: [defaultAdmin] };

// Ensure default admin always exists with correct password
if (initialAuth.users.length === 0) {
    initialAuth.users = [defaultAdmin];
} else {
    const adminIndex = initialAuth.users.findIndex(u => u.id === 'admin-1');
    if (adminIndex >= 0) {
        initialAuth.users[adminIndex] = defaultAdmin;
    } else {
        initialAuth.users.unshift(defaultAdmin);
    }
}

function createAuthStore() {
    const { subscribe, update } = writable<AuthState>(initialAuth);

    return {
        subscribe,
        login: (username: string, password: string) => {
            update((state: AuthState) => {
                const user = state.users.find(
                    (u: User) => u.username === username && u.password === password
                );
                if (user) {
                    const newState = { ...state, currentUser: user };
                    if (browser) {
                        localStorage.setItem('auth', JSON.stringify(newState));
                    }
                    return newState;
                }
                return state;
            });
        },
        logout: () => {
            update((state: AuthState) => {
                const newState = { ...state, currentUser: null };
                if (browser) {
                    localStorage.setItem('auth', JSON.stringify(newState));
                }
                return newState;
            });
        },
        createUser: (username: string, fullName: string, password: string, role: UserRole, createdBy: string) => {
            update((state: AuthState) => {
                const newUser: User = {
                    id: `user-${Date.now()}`,
                    username,
                    fullName,
                    password,
                    role,
                    createdAt: new Date().toISOString(),
                    createdBy
                };
                const newState = {
                    ...state,
                    users: [...state.users, newUser]
                };
                if (browser) {
                    localStorage.setItem('auth', JSON.stringify(newState));
                }
                return newState;
            });
        },
        deleteUser: (userId: string) => {
            update((state: AuthState) => {
                const newState = {
                    ...state,
                    users: state.users.filter((u: User) => u.id !== userId)
                };
                if (browser) {
                    localStorage.setItem('auth', JSON.stringify(newState));
                }
                return newState;
            });
        },
        updateUser: (userId: string, updates: Partial<User>) => {
            update((state: AuthState) => {
                const newState = {
                    ...state,
                    users: state.users.map((u: User) =>
                        u.id === userId ? { ...u, ...updates } : u
                    )
                };
                if (browser) {
                    localStorage.setItem('auth', JSON.stringify(newState));
                }
                return newState;
            });
        },
        changePassword: (userId: string, currentPassword: string, newPassword: string): boolean => {
            let success = false;
            update((state: AuthState) => {
                const user = state.users.find((u: User) => u.id === userId);
                if (user && user.password === currentPassword) {
                    const newState = {
                        ...state,
                        users: state.users.map((u: User) =>
                            u.id === userId ? { ...u, password: newPassword } : u
                        ),
                        currentUser: state.currentUser?.id === userId
                            ? { ...state.currentUser, password: newPassword }
                            : state.currentUser
                    };
                    if (browser) {
                        localStorage.setItem('auth', JSON.stringify(newState));
                    }
                    success = true;
                    return newState;
                }
                return state;
            });
            return success;
        },
        changeAdminPassword: (adminKey: string, currentPassword: string, newPassword: string): boolean => {
            let success = false;
            update((state: AuthState) => {
                const admin = state.users.find((u: User) => u.id === 'admin-1');
                if (admin && adminKey === ADMIN_KEY && admin.password === currentPassword) {
                    const newState = {
                        ...state,
                        users: state.users.map((u: User) =>
                            u.id === 'admin-1' ? { ...u, password: newPassword } : u
                        ),
                        currentUser: state.currentUser?.id === 'admin-1'
                            ? { ...state.currentUser, password: newPassword }
                            : state.currentUser
                    };
                    if (browser) {
                        localStorage.setItem('auth', JSON.stringify(newState));
                    }
                    success = true;
                    return newState;
                }
                return state;
            });
            return success;
        }
    };
}

export const auth = createAuthStore();
