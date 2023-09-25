import { createRoot } from "react-dom/client";
import { useModules } from "./modules";
import { App } from "./App";
import { ResolverProvider } from "@masonmesh/react";
import { extensionPoints } from "./ext";

import "./styles.css";

const root = document.getElementById("root");
if (!root) {
	throw new Error("Root element not found");
}

export function Root() {
	// TODO progress indicator would be nice
	const { isLoading, error } = useModules();
	if (isLoading) {
		return <div>Loading...</div>;
	}
	if (error) {
		return <div>Error: {error}</div>;
	}
	return (
		<ResolverProvider extensionPoints={extensionPoints}>
			<App />
		</ResolverProvider>
	);
}

createRoot(root).render(<Root />);
