import { loadModules } from "@/loadModules";

await loadModules({
	modules: ["bar"],
	moduleNameTransform: (mod) => `/${mod}.js`,
});

export default "No error thrown";
