import { createTokenizer as createMandarinTokenizer } from '@orama/tokenizers/mandarin';
import { createFromSource } from 'fumadocs-core/search/server';
import { source } from '@/libs/docs/source';

export const { GET } = createFromSource(source, {
	localeMap: {
		zh: {
			tokenizer: await createMandarinTokenizer(),
		},
	},
});
