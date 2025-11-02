/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./index.html',
		'./src/**/*.{js,jsx,ts,tsx}',
	],
	theme: {
		extend: {
			colors: {
				brand: {
					DEFAULT: '#5b2dd8',
					dark: '#4a22b5',
					light: '#7a50e6',
				},
			},
			boxShadow: {
				soft: '0 10px 30px -10px rgba(0,0,0,0.15)',
			},
		},
	},
	plugins: [],
}

