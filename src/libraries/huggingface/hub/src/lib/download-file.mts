import { HUB_URL } from "../consts.mts";
import { createApiError } from "../error.mts";
import type { Credentials, RepoDesignation } from "../types/public.d.ts";
import { checkCredentials } from "../utils/checkCredentials.mts";
import { toRepoId } from "../utils/toRepoId.mts";

/**
 * @returns null when the file doesn't exist
 */
export async function downloadFile(params: {
	repo: RepoDesignation;
	path: string;
	/**
	 * If true, will download the raw git file.
	 *
	 * For example, when calling on a file stored with Git LFS, the pointer file will be downloaded instead.
	 */
	raw?: boolean;
	revision?: string;
	/**
	 * Fetch only a specific part of the file
	 */
	range?: [number, number];
	credentials?: Credentials;
	hubUrl?: string;
	/**
	 * Custom fetch function to use instead of the default one, for example to use a proxy or edit headers.
	 */
	fetch?: typeof fetch;
	requestInit?: RequestInit;
}): Promise<Response | null> {
	checkCredentials(params.credentials);
	const repoId = toRepoId(params.repo);
	const url = `${params.hubUrl ?? HUB_URL}/${repoId.type === "model" ? "" : `${repoId.type}s/`}${repoId.name}/${
		params.raw ? "raw" : "resolve"
	}/${encodeURIComponent(params.revision ?? "main")}/${params.path}`;

	const resp = await (params.fetch ?? fetch)(url, {
		headers: {
			...(params.credentials
				? {
						Authorization: `Bearer ${params.credentials.accessToken}`,
				  }
				: {}),
			...(params.range
				? {
						Range: `bytes=${params.range[0]}-${params.range[1]}`,
				  }
				: {}),
		},
		...params.requestInit,
	});

	if (resp.status === 404 && resp.headers.get("X-Error-Code") === "EntryNotFound") {
		return null;
	} else if (!resp.ok) {
		throw await createApiError(resp);
	}

	return resp;
}
