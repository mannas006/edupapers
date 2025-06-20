import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  plugins: {
    tailwindcss: {
      config: resolve(__dirname, 'tailwind.config.js'), // Reference to Tailwind config
    },
    autoprefixer: {},
  },
};
