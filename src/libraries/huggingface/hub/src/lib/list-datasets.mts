import { HUB_URL } from "../consts.mts";
import { createApiError } from "../error.mts";
import type { ApiDatasetInfo } from "../types/api/api-dataset.d.ts";
import type { Credentials } from "../types/public.d.ts";
import { checkCredentials } from "../utils/checkCredentials.mts";
import { parseLinkHeader } from "../utils/parseLinkHeader.mts";

const EXPAND_KEYS = ["private", "downloads", "gated", "likes", "lastModified"] satisfies (keyof ApiDatasetInfo)[];

export interface DatasetEntry {
	id: string;
	name: string;
	private: boolean;
	downloads: number;
	gated: false | "auto" | "manual";
	likes: number;
	updatedAt: Date;
}

export async function* listDatasets(params?: {
	search?: {
		owner?: string;
	} | string;
	credentials?: Credentials;
	hubUrl?: string;
	/**
	 * Custom fetch function to use instead of the default one, for example to use a proxy or edit headers.
	 */
	fetch?: typeof fetch;
	requestInit?: RequestInit;
}): AsyncGenerator<DatasetEntry> {
	checkCredentials(params?.credentials);
	const search = new URLSearchParams([
		...Object.entries({
			limit: "500",
			...(
				typeof params?.search === "string" ? { search: params?.search }
				: params?.search?.owner ? { author: params.search.owner }
				: undefined),
		}),
		...EXPAND_KEYS.map((val) => ["expand", val] satisfies [string, string]),
	]).toString();
	let url: string | undefined = `${params?.hubUrl || HUB_URL}/api/datasets` + (search ? "?" + search : "");

	while (url) {
		const res: Response = await (params?.fetch ?? fetch)(url, {
			headers: {
				accept: "application/json",
				...(params?.credentials ? { Authorization: `Bearer ${params.credentials.accessToken}` } : undefined),
			},
			...params.requestInit,
		});

		if (!res.ok) {
			throw createApiError(res);
		}

		const items: ApiDatasetInfo[] = await res.json();

		for (const item of items) {
			yield {
				id: item._id,
				name: item.id,
				private: item.private,
				downloads: item.downloads,
				likes: item.likes,
				gated: item.gated,
				updatedAt: new Date(item.lastModified),
			};
		}

		const linkHeader = res.headers.get("Link");

		url = linkHeader ? parseLinkHeader(linkHeader).next : undefined;
	}
}
