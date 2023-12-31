import { HUB_URL } from "../consts.mts";
import { createApiError } from "../error.mts";
import type { Credentials, RepoDesignation } from "../types/public.d.ts";
import { checkCredentials } from "../utils/checkCredentials.mts";
import { toRepoId } from "../utils/toRepoId.mts";

export async function deleteRepo(params: {
	repo: RepoDesignation;
	credentials: Credentials;
	hubUrl?: string;
	/**
	 * Custom fetch function to use instead of the default one, for example to use a proxy or edit headers.
	 */
	fetch?: typeof fetch;
	requestInit?: RequestInit;
}): Promise<void> {
	checkCredentials(params.credentials);
	const repoId = toRepoId(params.repo);
	const [namespace, repoName] = repoId.name.split("/");

	const res = await (params.fetch ?? fetch)(`${params.hubUrl ?? HUB_URL}/api/repos/delete`, {
		method: "DELETE",
		body: JSON.stringify({
			name: repoName,
			organization: namespace,
			type: repoId.type,
		}),
		headers: {
			Authorization: `Bearer ${params.credentials.accessToken}`,
			"Content-Type": "application/json",
		},
		...params.requestInit,
	});

	if (!res.ok) {
		throw await createApiError(res);
	}
}
