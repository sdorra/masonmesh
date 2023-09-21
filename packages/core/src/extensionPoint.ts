export type Predicate<TParam> = (params: TParam) => boolean;

type Extension<TExtensionType, TPredicateParam> = {
	extension: TExtensionType;
	predicate?: Predicate<TPredicateParam>;
	plugin?: string;
};

const policies = ["first", "last", "error"] as const;

type SingleOptions = {
	policy: (typeof policies)[number];
};

const defaultSingleOptions: SingleOptions = {
	policy: "error",
};

type MultiOptions = {
	limit?: number;
};

const defaultMultiOptions: MultiOptions = {};

type Options = SingleOptions | MultiOptions;

export type ExtensionPoint<
	TExtensionType,
	TKey extends string,
	TPredicateParam,
	TMulti extends boolean,
> = {
	key: TKey;
	bind(extension: Extension<TExtensionType, TPredicateParam>): void;
	unbindAllFromPlugin(plugin: string): void;
	extensions: () => Array<Extension<TExtensionType, TPredicateParam>>;
	isMulti: TMulti;
};

function isSingleOptions(options: Options): options is SingleOptions {
	return (options as SingleOptions).policy !== undefined;
}

function createExtensionPoint<
	TExtensionType,
	TKey extends string,
	TPredicateParams,
	TMulti extends boolean,
>(
	key: TKey,
	options: Options,
	isMulti: TMulti,
): ExtensionPoint<TExtensionType, TKey, TPredicateParams, TMulti> {
	const extensions: Array<Extension<TExtensionType, TPredicateParams>> = [];

	function bind(extension: Extension<TExtensionType, TPredicateParams>) {
		if (isSingleOptions(options)) {
			if (extensions.length > 0) {
				if (options.policy === "error") {
					throw new Error(
						`Extension point '${key}' does not support multiple extensions.`,
					);
				} else if (options.policy === "last") {
					extensions.splice(0, extensions.length);
				} else if (options.policy === "first") {
					return;
				}
			}
		} else {
			if (options.limit && extensions.length >= options.limit) {
				throw new Error(
					`Extension point '${key}' does not support more than ${options.limit} extensions.`,
				);
			}
		}
		extensions.push(extension);
	}

	function unbindAllFromPlugin(plugin: string) {
		extensions
			.filter((e) => e.plugin === plugin)
			.forEach((e) => {
				const index = extensions.indexOf(e);
				if (index > -1) {
					extensions.splice(index, 1);
				}
			});
	}

	return {
		key,
		bind,
		extensions: () => [...extensions],
		unbindAllFromPlugin,
		isMulti,
	};
}

function validateSingleOptions(options: SingleOptions) {
	if (!policies.includes(options.policy)) {
		throw new Error(`Unknown policy '${options.policy}'`);
	}
}

export function extensionPoint<TExtensionType, TPredicateParam = undefined>() {
	return {
		single: <TKey extends string>(
			key: TKey,
			options: SingleOptions = defaultSingleOptions,
		) => {
			validateSingleOptions(options);
			return createExtensionPoint<TExtensionType, TKey, TPredicateParam, false>(
				key,
				options,
				false,
			);
		},
		multi: <TKey extends string>(
			key: TKey,
			options: MultiOptions = defaultMultiOptions,
		) =>
			createExtensionPoint<TExtensionType, TKey, TPredicateParam, true>(
				key,
				options,
				true,
			),
	};
}
