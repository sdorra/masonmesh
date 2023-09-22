import { AnyExtensionPoint } from "@masonmesh/core";

export interface Register {
	// should be set from application
	// extensionPoints: Array<AnyExtensionPoint>;
}

export type RegisteredExtensionPointArray = Register extends {
	extensionPoints: infer TExtensionPointArray;
}
	? TExtensionPointArray
	: Array<AnyExtensionPoint>;

export type RegisteredExtensionPoints = RegisteredExtensionPointArray[number];
