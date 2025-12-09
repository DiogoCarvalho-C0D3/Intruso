/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            colors: {
                skin: {
                    base: 'rgb(var(--color-bg) / <alpha-value>)',
                    card: 'rgb(var(--color-card) / <alpha-value>)',
                    border: 'rgb(var(--color-border) / <alpha-value>)',
                    text: 'rgb(var(--color-text) / <alpha-value>)',
                    muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
                    primary: 'rgb(var(--color-primary) / <alpha-value>)',
                    'primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
                }
            },
            animation: {
                'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both infinite',
                'fade-in': 'fadeIn 0.5s ease-out forwards',
            },
            keyframes: {
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-5px) rotate(-5deg)' },
                    '75%': { transform: 'translateX(5px) rotate(5deg)' },
                },
                fadeIn: {
                    'from': { opacity: '0', transform: 'translateY(10px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}
