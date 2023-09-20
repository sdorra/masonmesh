/* eslint-disable @typescript-eslint/no-explicit-any */

import { ExtensionPoint, Predicate } from "./extensionPoint";

export type GetKey<TExtensionPoint> = TExtensionPoint extends ExtensionPoint<
	any,
	infer TKey,
	any
>
	? TKey
	: never;

type GetExtensionType<TExtensionPoint> = TExtensionPoint extends ExtensionPoint<
	infer TExtensionType,
	any,
	any
>
	? TExtensionType
	: never;

type GetPredicateParams<TExtensionPoint> =
	TExtensionPoint extends ExtensionPoint<any, any, infer TPredicateParams>
		? TPredicateParams
		: never;

export type Binder<TExtensionPoints, TKeys> = {
	bind: <
		TKey extends TKeys,
		TExtension extends Extract<TExtensionPoints, { key: TKey }>,
	>(
		key: TKey,
		extension: GetExtensionType<TExtension>,
		predicate?: Predicate<GetPredicateParams<TExtension>>,
	) => void;
};

export function createBinder<
	TExtensionPointArray extends Array<ExtensionPoint<any, any, any>>,
	TExtensionPoints extends TExtensionPointArray[number],
	TKeys = GetKey<TExtensionPoints>,
>(
	extensions: TExtensionPointArray,
	plugin?: string,
): Binder<TExtensionPoints, TKeys> {
	return {
		bind: <
			TKey extends TKeys,
			TExtension extends Extract<TExtensionPoints, { key: TKey }>,
		>(
			key: TKey,
			extension: GetExtensionType<TExtension>,
			predicate?: Predicate<GetPredicateParams<TExtension>>,
		) => {
			const ep = extensions.find((e) => e.key === key);
			if (!ep) {
				throw new Error(`Extension point '${key}' not found.`);
			}

			ep.bind({
				extension,
				predicate,
				plugin,
			});
		},
	};
}
