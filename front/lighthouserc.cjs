module.exports = {
	ci: {
		upload: {
			target: "filesystem",
			outputDir: "./lhci-report",
		},
		collect: {
			url: [
				"http://localhost:4173",
				"http://localhost:4173/login",
				"http://localhost:4173/register",
				"http://localhost:4173/monitoring",
				"http://localhost:4173/terminal",
			],
			startServerCommand: "bun run preview",
			startServerReadyPattern: "Local:",
			startServerReadyTimeout: 10000,
			numberOfRuns: 1,
		},
		assert: {
			assertions: {
				"categories:performance": ["warn", { minScore: 0.8 }],
				"categories:accessibility": ["error", { minScore: 0.9 }],
				"categories:best-practices": ["warn", { minScore: 0.8 }],
				"categories:seo": ["warn", { minScore: 0.8 }],
			},
		},
	},
};
