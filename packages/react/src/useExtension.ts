import {
	GetExtensionType,
	GetIsMulti,
	GetKey,
	GetPredicateParam,
	Predicate,
} from "@masonmesh/core";
import { RegisteredExtensionPoints } from "./types";
import { useResolver } from "./useResolver";

// TODO is same typing as resolver. Can we reuse?

export function useExtension<
	TKey extends GetKey<RegisteredExtensionPoints>,
	TExtensionPoint = Extract<RegisteredExtensionPoints, { key: TKey }>,
	TExtensionType = GetExtensionType<TExtensionPoint>,
	TPredicateParam = GetPredicateParam<TExtensionPoint>,
	TIsMulti = GetIsMulti<TExtensionPoint>,
>(
	key: TKey,
	...args: TPredicateParam extends undefined ? [] : [Predicate<TPredicateParam>]
): TIsMulti extends true ? Array<TExtensionType> : TExtensionType | null {
	const resolver = useResolver();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return resolver.resolve(key, ...(args as any));
}
