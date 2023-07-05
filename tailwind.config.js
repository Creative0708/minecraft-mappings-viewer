/** @type {import('tailwindcss').Config} */
module.exports = {
    theme: {
        extend: {
            colors: {
                'ground': 'var(--surface-ground)',
                'section': 'var(--surface-section)',
                'card': 'var(--surface-card)',
                'overlay': 'var(--surface-overlay)',
                'border': 'var(--surface-border)',
                'hover': 'var(--surface-hover)',

                'text': 'var(--text-color)',
                'text-secondary': 'var(--text-secondary-color)',
                'primary': 'var(--primary-color)',
                'primary-text': 'var(--primary-color-text)',

                'bg-highlight': 'var(--highlight-bg)',
                'text-highlight': 'var(--highlight-text-color)',
            },
            fontFamily: {
                'sans': 'var(--font-family)',
            }
        },
    },
    plugins: [],
    content: [
        './public/index.html',
        './src/**/*.{vue,js,ts,jsx,tsx}'
    ],
    corePlugins: {
        preflight: false,
    }
}

