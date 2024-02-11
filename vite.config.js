// noinspection JSCheckFunctionSignatures

/**
* @see [vitejs.dev/config]{@link https://vitejs.dev/config}
*/

import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

/**
* @function
* @param {import('vite').ConfigEnv} config
* @returns {import('vite').UserConfig}
*/
const configFn = ({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: env.BASE_URL,

    plugins: [],

    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./node_modules', import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
      extensions: ['.js', '.mjs', '.json', '.ts']
    },

    css: {
      preprocessorOptions: {
        scss: {}
      }
    },

    server: {
      open: './',
      fs: {
        allow: ['.']
      }
    },

    esbuild: {
      drop: command === 'serve' ? [] : ['console']
    }
  }
}

export default defineConfig(configFn)
