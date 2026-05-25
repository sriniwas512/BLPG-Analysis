/** @type {import('tailwindcss').Config} */
// Tokyo Night palette — based on enkia/tokyo-night-vscode-theme
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        tn: {
          bg:        '#1a1b26',  // main background
          'bg-dark': '#16161e',  // header / sidebars
          'bg-alt':  '#24283b',  // cards, inputs
          'bg-hi':   '#292e42',  // hovered rows
          border:    '#414868',  // borders
          fg:        '#c0caf5',  // main text
          'fg-dim':  '#a9b1d6',  // secondary text
          muted:     '#565f89',  // labels, comments
          blue:      '#7aa2f7',  // primary accent
          cyan:      '#7dcfff',  // secondary accent
          purple:    '#bb9af7',
          green:     '#9ece6a',
          yellow:    '#e0af68',
          orange:    '#ff9e64',
          red:       '#f7768e',
          magenta:   '#ff007c',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
