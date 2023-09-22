import { loadModules } from "@/loadModules";

const test: string[] = [];

await loadModules({
	modules: ["foo"],
	moduleNameTransform: (mod) => `./${mod}.js`,
	staticModules: {
		test: test,
	},
});

export default `Executed module ${test.join(", ")}`;
