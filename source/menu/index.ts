import TelegrafInlineMenu from 'telegraf-inline-menu'

import {setLabel, setDescription} from '../lib/wikidata-edit'

import languageMenu from './languages'

async function wdKeysWithMissingInformation(ctx: any): Promise<string[]> {
	const resourceKeys: string[] = ctx.wd.wikidata.availableResourceKeys()

	const missingInfoKeys = resourceKeys
		.filter(o => ctx.wd.infoMissing(o))

	return missingInfoKeys
}

async function everythingDone(ctx: any): Promise<boolean> {
	const keys = await wdKeysWithMissingInformation(ctx)
	return keys.length === 0
}

async function currentWdKey(ctx: any): Promise<string> {
	const {page} = ctx.session
	const keys = await wdKeysWithMissingInformation(ctx)
	const selectedPage = Math.min(keys.length, page)
	return keys[selectedPage - 1]
}

async function menuText(ctx: any): Promise<string> {
	const currentKey = await currentWdKey(ctx)
	if (!currentKey) {
		return 'all items have labels and descriptions! select different language'
	}

	let text = ''
	text += '`'
	text += currentKey
	text += '`'
	text += '\n\n'
	text += 'en Label: '
	text += `*${ctx.wd.wikidata.label(currentKey, 'en')}*\n`
	text += 'en Description: '
	text += ctx.wd.wikidata.description(currentKey, 'en')
	text += '\n\n'
	text += ctx.wd.locale()
	text += ' Label: '
	text += `*${ctx.wd.label(currentKey)}*\n`
	text += ctx.wd.locale()
	text += ' Description: '
	text += ctx.wd.description(currentKey)
	text += '\n\n'

	return text
}

const menu = new TelegrafInlineMenu(menuText)
menu.setCommand('start')

menu.pagination('page', {
	getCurrentPage: (ctx: any) => ctx.session.page,
	getTotalPages: async (ctx: any) => (await wdKeysWithMissingInformation(ctx)).length,
	setPage: (ctx: any, page) => {
		ctx.session.page = page
	}
})

function setHideFunc(entry: 'label' | 'description'): (ctx: any) => Promise<boolean> {
	return async (ctx: any) => {
		const currentKey = await currentWdKey(ctx)
		if (!currentKey) {
			return true
		}

		const qNumber = ctx.wd.wikidata.qNumberOfKey(currentKey)
		return ctx.wd[entry](currentKey) !== qNumber
	}
}

menu.question('Set Label', 'label', {
	hide: setHideFunc('label'),
	questionText: 'What should the label be?',
	setFunc: async (ctx: any, answer) => {
		const currentKey = await currentWdKey(ctx)
		const qNumber = ctx.wd.wikidata.qNumberOfKey(currentKey)
		const lang = ctx.wd.locale()
		console.log('set label', currentKey, qNumber, lang, answer)
		await setLabel(qNumber, lang, answer)
		await ctx.wd.wikidata.load()
	}
})

menu.question('Set Description', 'description', {
	joinLastRow: true,
	hide: setHideFunc('description'),
	questionText: 'What should the description be?',
	setFunc: async (ctx: any, answer) => {
		const currentKey = await currentWdKey(ctx)
		const qNumber = ctx.wd.wikidata.qNumberOfKey(currentKey)
		const lang = ctx.wd.locale()
		console.log('set description', currentKey, qNumber, lang, answer)
		await setDescription(qNumber, lang, answer)
		await ctx.wd.wikidata.load()
	}
})

menu.urlButton('Wikidata Item', async (ctx: any) => {
	const currentKey = await currentWdKey(ctx)
	return ctx.wd.url(currentKey)
}, {
	hide: everythingDone
})

menu.submenu(async (ctx: any) => `${await ctx.wd.label('menu.language')}`, 'lang', languageMenu)

export default menu
