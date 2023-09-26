/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import {
	AnyExtensionPoint,
	GetExtensionType,
	GetPredicateParam,
} from "@masonmesh/core";
import { ComponentType } from "react";

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

export type NonEmptyObject<T> = T extends Record<any, never>
	? never
	: T extends {}
	? T
	: never;

export type PredicateParam<TExtensionPoint extends AnyExtensionPoint> =
	GetPredicateParam<TExtensionPoint> extends undefined
		? {}
		: {
				predicateParam: GetPredicateParam<TExtensionPoint>;
		  };

export type ComponentProps<TExtensionPoint extends AnyExtensionPoint> =
	GetExtensionType<TExtensionPoint> extends ComponentType<infer TProps>
		? NonEmptyObject<TProps> extends never
			? {}
			: { props: TProps }
		: {};
