import {wikidataEditConfig} from '../config'

/* eslint @typescript-eslint/no-require-imports: warn */
/* eslint @typescript-eslint/no-var-requires: warn */
const wdEditInitFunc = require('wikidata-edit')

const wdEdit: any = wdEditInitFunc(wikidataEditConfig)

export async function setLabel(qNumber: string, lang: string, newContent: string): Promise<void> {
	await wdEdit.label.set(qNumber, lang, newContent)
}

export async function setDescription(qNumber: string, lang: string, newContent: string): Promise<void> {
	await wdEdit.description.set(qNumber, lang, newContent)
}
