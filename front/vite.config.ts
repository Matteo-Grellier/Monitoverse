import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { configDefaults } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		watch: {
			usePolling: true,
		},
		host: true,
	},
	build: {
		sourcemap: mode === "development",
	},
	base: "./",
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: "./src/setupTests.ts",
		exclude: [...configDefaults.exclude, "e2e/*"],
	},
}));
