import TelegrafInlineMenu from 'telegraf-inline-menu'

import {wikidataInfoHeader} from '../lib/interface/generals'

const menu = new TelegrafInlineMenu(async ctx => languageMenuText(ctx))

async function languageMenuText(ctx: any): Promise<string> {
	let text = await wikidataInfoHeader(ctx, 'menu.language')
	text += '\n\n'

	const translationProgress = ctx.wd.wikidata.translationProgress(ctx.wd.locale()) * 100
	text += `${Math.round(translationProgress * 10) / 10} %`

	return text
}

menu.select('lang', (ctx: any) => ctx.wd.wikidata.availableLocales(), {
	columns: 3,
	isSetFunc: (ctx: any, key) => key === ctx.wd.locale(),
	setFunc: (ctx: any, key) => {
		ctx.wd.locale(key)
	},
	getCurrentPage: (ctx: any) => ctx.session.page,
	setPage: (ctx: any, page) => {
		ctx.session.page = page
	}
})

export default menu
