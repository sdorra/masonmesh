import { loadModules } from "@/loadModules";

await loadModules({
	modules: ["exec-error"],
	moduleNameTransform: (mod) => `/${mod}.js`,
	timeout: 250,
});

export default "No error thrown";
