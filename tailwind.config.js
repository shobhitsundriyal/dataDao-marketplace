/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./app/**/*.{js,ts,jsx,tsx}',
		'./pages/**/*.{js,ts,jsx,tsx}',
		'./components/**/*.{js,ts,jsx,tsx}',

		// Or if using `src` directory:
		'./src/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			aspectRatio: {
				'4/3': '4 / 3',
			},
			screens: {
				brp: '1440px',
			},
		},
	},
	plugins: [require('daisyui'), require('@tailwindcss/line-clamp')],

	daisyui: {
		themes: ['dracula'],
	},
}
