import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─── BUAZZZ Design Tokens ───
        'juice-orange': '#FF6B00',
        'pure-black': '#000000',
        'pure-white': '#FFFFFF',
        'sky-accent': '#B8DEFA',

        // Material You inspired palette (hijau buah)
        primary: '#4a6700',
        'on-primary': '#ffffff',
        'primary-container': '#a8e501',
        'on-primary-container': '#476300',
        'primary-fixed': '#b8f625',
        'primary-fixed-dim': '#9fd800',
        'on-primary-fixed': '#141f00',
        'on-primary-fixed-variant': '#374e00',
        'inverse-primary': '#9fd800',

        secondary: '#4a6703',
        'on-secondary': '#ffffff',
        'secondary-container': '#c5ea7d',
        'on-secondary-container': '#4d6a06',
        'secondary-fixed': '#cbef82',
        'secondary-fixed-dim': '#b0d369',
        'on-secondary-fixed': '#141f00',
        'on-secondary-fixed-variant': '#374e00',

        tertiary: '#625885',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#d8cbff',
        'on-tertiary-container': '#5e5480',
        'tertiary-fixed': '#e7deff',
        'tertiary-fixed-dim': '#ccbff3',
        'on-tertiary-fixed': '#1e143d',
        'on-tertiary-fixed-variant': '#4a406b',

        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',

        surface: '#f8fbe6',
        'surface-bright': '#f8fbe6',
        'surface-dim': '#d8dcc8',
        'surface-variant': '#e1e5d0',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f6e1',
        'surface-container': '#ecf0db',
        'surface-container-high': '#e7ead6',
        'surface-container-highest': '#e1e5d0',
        'on-surface': '#191d11',
        'on-surface-variant': '#434934',
        'inverse-surface': '#2e3224',
        'inverse-on-surface': '#eff3de',

        background: '#f8fbe6',
        'on-background': '#191d11',

        outline: '#737a62',
        'outline-variant': '#c3caae',
        'surface-tint': '#4a6700',
      },

      fontFamily: {
        headline: ['Anybody', 'sans-serif'],
        display: ['Anybody', 'sans-serif'],
        body: ['Hanken Grotesk', 'sans-serif'],
        label: ['Hanken Grotesk', 'sans-serif'],
        'headline-xl': ['Anybody', 'sans-serif'],
        'headline-lg': ['Anybody', 'sans-serif'],
        'headline-lg-mobile': ['Anybody', 'sans-serif'],
        'headline-md': ['Anybody', 'sans-serif'],
        'body-lg': ['Hanken Grotesk', 'sans-serif'],
        'body-md': ['Hanken Grotesk', 'sans-serif'],
        'label-bold': ['Hanken Grotesk', 'sans-serif'],
        'label-sm': ['Hanken Grotesk', 'sans-serif'],
      },

      fontSize: {
        'headline-xl': ['80px', { lineHeight: '1.0', letterSpacing: '-0.04em', fontWeight: '900' }],
        'headline-lg': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-lg-mobile': ['36px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-md': ['24px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '500' }],
        'body-md': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-bold': ['14px', { lineHeight: '1.2', fontWeight: '700' }],
        'label-sm': ['12px', { lineHeight: '1.2', fontWeight: '600' }],
      },

      spacing: {
        'section-gap': '80px',
        gutter: '16px',
        'container-margin': '24px',
        base: '8px',
        'card-padding': '24px',
      },

      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },

      boxShadow: {
        'neubrutal': '6px 6px 0px 0px rgba(0,0,0,1)',
        'neubrutal-sm': '4px 4px 0px 0px rgba(0,0,0,1)',
        'neubrutal-lg': '8px 8px 0px 0px rgba(0,0,0,1)',
        'neubrutal-hover': '2px 2px 0px 0px rgba(0,0,0,1)',
        'neubrutal-active': '0px 0px 0px 0px rgba(0,0,0,1)',
      },

      animation: {
        'bounce-slow': 'bounce 4s infinite',
      },
    },
  },
  plugins: [],
}

export default config
