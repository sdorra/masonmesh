import React, { useContext } from "react";
import { createResolver } from "@masonmesh/core";
import { RegisteredExtensionPointArray } from "./types";

type Resolver = ReturnType<
	typeof createResolver<RegisteredExtensionPointArray>
>;

const ResolverContext = React.createContext<Resolver | null>(null);

type ResolverProviderProps = {
	extensionPoints: RegisteredExtensionPointArray;
	children: React.ReactNode;
};

export function ResolverProvider({
	extensionPoints,
	children,
}: ResolverProviderProps) {
	const [resolver, setResolver] = React.useState<Resolver | null>(null);
	React.useEffect(() => {
		const resolver = createResolver(extensionPoints);
		setResolver(resolver);
	}, [extensionPoints]);
	if (!resolver) {
		return null;
	}
	return (
		<ResolverContext.Provider value={resolver}>
			{children}
		</ResolverContext.Provider>
	);
}

export function useResolver(): Resolver {
	const resolver = useContext(ResolverContext);
	if (!resolver) {
		throw new Error("No resolver found");
	}
	return resolver;
}
