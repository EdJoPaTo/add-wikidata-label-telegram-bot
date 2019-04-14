import {readFileSync} from 'fs'

import Telegraf from 'telegraf'

import * as userSessions from './lib/user-sessions'
import WikidataLabel from './lib/wikidata-label-middleware'
import menu from './menu'

const tokenFilePath = 'token.txt'
const token = readFileSync(tokenFilePath, 'utf8').trim()
const bot = new Telegraf(token)

bot.use(userSessions.middleware())

const wdLabel = new WikidataLabel('wikidata-items.yaml')
wdLabel.load()
bot.use(wdLabel.middleware())

bot.use(async (ctx: any, next) => {
	// Quick and dirty
	// Think about a 'keepMenu' flag for menu.question()
	ctx.deleteMessage = ctx.editMessageReplyMarkup
	return next && next()
})

bot.use(menu.init({
	backButtonText: '🔙 back',
	mainMenuButtonText: (ctx: any) => `🔝 ${ctx.wd.label('menu.menu')}`
}))

bot.catch((error: any) => {
	console.error('telegraf error occured', error)
})

bot.startPolling()
