interface InfoHeaderOptions {
	titlePrefix?: string;
	titleSuffix?: string;
}

export async function wikidataInfoHeader(ctx: any, wdKey: string, options: InfoHeaderOptions = {}): Promise<string> {
	const {titlePrefix, titleSuffix} = options
	const label = await ctx.wd.label(wdKey)
	const description = await ctx.wd.description(wdKey)

	let text = ''

	if (titlePrefix) {
		text += titlePrefix
		text += ' '
	}

	text += `*${label}*`

	if (titleSuffix) {
		text += ' '
		text += titleSuffix
	}

	text += '\n'
	text += `${description}`

	if (await ctx.wd.infoMissing(wdKey)) {
		text += '\n\n'
		text += 'some info is missing on the wikidata item'
	}

	return text
}
