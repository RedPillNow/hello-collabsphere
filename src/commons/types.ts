import * as Alexa from 'ask-sdk-core';
import { Response, interfaces } from 'ask-sdk-model';
import TextContent = interfaces.display.TextContent;
import Template = interfaces.display.Template;

export type IntentHandler = {
	canHandle(handlerInput?: Alexa.HandlerInput): boolean,
	handle(handlerInput: Alexa.HandlerInput, error?: any): Response
}

export type XhrOptions = {
	method: string,
	uri: string,
	resolveFullResponse: boolean,
	json: boolean,
	headers?: any,
	userName?: string,
	password?: string,
	body?: any,
	formData?: any
}

export type TextResponse = {
	textContent: TextContent,
	reprompt?: string,
	cardTitle: string,
	renderTemplate?: Template,
	cardText?: string,
	cardImage?: string
}

export type FirestoreQuerySelect = {
	fields: FirestoreQueryField[];
}

export type FirestoreQueryFrom = {
	collectionId: string;
}

export type FirestoreCompositeFilter = {
	filters: any[],
	op: string
}

export type FirestoreFieldFilter = {
	field: any,
	op: string,
	value: any
}

export type FirestoreQueryField = {
	fieldPath: string;
}

export type FirestoreQueryWhere = {
	compositeFilter?: FirestoreCompositeFilter;
	fieldFilter?: FirestoreFieldFilter;
}

export type FirestoreStructuredQuery = {
	select?: FirestoreQuerySelect,
	from: FirestoreQueryFrom,
	where: FirestoreQueryWhere
}

export type FirestoreQuery = {
	structuredQuery?: FirestoreStructuredQuery;
}
