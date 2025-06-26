import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Función para detectar la preferencia del sistema
function getSystemTheme(): 'light' | 'dark' {
    if (browser && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

// Función para obtener el tema guardado o usar el del sistema
function getInitialTheme(): 'light' | 'dark' {
    if (browser) {
        const saved = localStorage.getItem('domify-theme');
        if (saved === 'light' || saved === 'dark') {
            return saved;
        }
        return getSystemTheme();
    }
    return 'light';
}

// Store del tema
export const theme = writable<'light' | 'dark'>(getInitialTheme());

// Función para alternar el tema
export function toggleTheme() {
    theme.update(current => {
        const newTheme = current === 'light' ? 'dark' : 'light';
        
        if (browser) {
            localStorage.setItem('domify-theme', newTheme);
            
            // Aplicar el tema al documento
            if (newTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
        
        return newTheme;
    });
}

// Función para aplicar el tema inicial
export function applyTheme(themeValue: 'light' | 'dark') {
    if (browser) {
        if (themeValue === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
} 