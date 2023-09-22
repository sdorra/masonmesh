import { loadModules } from "@/loadModules";

await loadModules({
	modules: ["404"],
	moduleNameTransform: (mod) => `/${mod}.js`,
	timeout: 200,
});

export default "No error thrown";
