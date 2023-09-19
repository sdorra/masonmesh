/* eslint-disable @typescript-eslint/no-explicit-any */

import { ExtensionPoint } from "./extensionPoint";

type GetKey<TExtensionPoint> = TExtensionPoint extends ExtensionPoint<
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

export function createBinder<
	TExtensionPointArray extends Array<ExtensionPoint<any, any, any>>,
	TExtensionPoints extends TExtensionPointArray[number],
	TKeys = GetKey<TExtensionPoints>,
>(extensions: TExtensionPointArray, plugin?: string) {
	return {
		bind: <TKey extends TKeys>(
			key: TKey,
			extension: GetExtensionType<Extract<TExtensionPoints, { key: TKey }>>,
			predicate?: (
				param: GetPredicateParams<Extract<TExtensionPoints, { key: TKey }>>,
			) => boolean,
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
