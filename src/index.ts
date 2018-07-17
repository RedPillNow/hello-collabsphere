import * as Alexa from 'ask-sdk-core';
import { Response, IntentRequest } from 'ask-sdk-model';
import * as rpTypes from './commons/types';
import {ResponseGenerator} from './commons/response-generator';
import * as utils from './commons/utils';
import { DataHelper } from './data/dataHelper';

const APP_ID = 'amzn1.ask.skill.6ae3d277-34f5-43c1-a52c-08b318becb16';

/**
 * Fired when the skill is launched
 */
const LaunchRequestHandler: rpTypes.IntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput): boolean {
		return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
	},
	handle(handlerInput: Alexa.HandlerInput): Response {
		let sessAttrs = handlerInput.attributesManager.getSessionAttributes();
		let resp = ResponseGenerator.launchResponse;
		const speechText = resp.textContent.primaryText.text;
		sessAttrs.speechOutput = speechText;
		handlerInput.attributesManager.setSessionAttributes(sessAttrs);

		return handlerInput.responseBuilder
			.speak(speechText)
			.reprompt(speechText)
			.withSimpleCard(resp.cardTitle, speechText)
			.withShouldEndSession(false)
			.getResponse();
	}
};
/**
 * GeneralGreetingIntent handler. Will respond with a random greeting
 */
const GeneralGreetingIntentHandler: rpTypes.IntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput): boolean {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'GeneralGreetingIntent';
	},
	handle(handlerInput: Alexa.HandlerInput): Response {
		let sessAttrs = handlerInput.attributesManager.getSessionAttributes();
		let resp = ResponseGenerator.generalGreetingResponse;
		const speechText = resp.textContent.primaryText.text;

		sessAttrs.speechOutput = speechText;
		handlerInput.attributesManager.setSessionAttributes(sessAttrs);
		return handlerInput.responseBuilder
			.speak(speechText)
			.withSimpleCard(resp.cardTitle, speechText)
			.getResponse();
	}
};
/**
 * This is actually an ALL request interceptor. However, we include a 'canHandle'
 * determination that only actually does anything for the SessionsIntent.
 * Will fetch the sessions based on the slot values available
 */
const SessionsRequestInterceptor = {
	process(handlerInput: Alexa.HandlerInput): Promise<void> {
		let requestType = handlerInput.requestEnvelope.request.type;
		if (requestType === 'IntentRequest') {
			let canHandle = false;
			let intent = (<IntentRequest> handlerInput.requestEnvelope.request).intent;
			let intentName = intent.name;
			if (intentName === 'SessionsIntent') {
				canHandle = true;
			}
			console.log('SessionsRequestInterceptor, canHandle=', canHandle);
			if (canHandle) {
				let sessAttrs = handlerInput.attributesManager.getSessionAttributes();
				if (sessAttrs.foundSessions && intentName === 'SessionsIntent') {
					delete sessAttrs.foundSessions;
					delete sessAttrs.nextSlotIdx;
					delete sessAttrs.slotVals;
					delete sessAttrs.lastFoundIndex;
				}
				let slots = intent.slots;
				let multiSlotVals = slots['SessionName'].value ? true : false;
				let slotVals = utils.getSlotValues(slots, multiSlotVals);
				let slotVal = multiSlotVals ? {SessionName: slotVals['SessionName'][0]} : slotVals;
				return DataHelper.findSessions(slotVal)
					.then((response) => {
						console.log('SessionsRequestInterceptor, response=', response);
						if (utils.isResponseValid(response)) {
							sessAttrs.foundSessions = response;
							if (multiSlotVals) {
								sessAttrs.slotVals = slotVals;
								sessAttrs.nextSlotIdx = 1;
							}
							handlerInput.attributesManager.setSessionAttributes(sessAttrs);
						}
					});
			}
		}
		return null;
	}
}
/**
 * The intent handler for requesting sessions
 */
const SessionsIntentHandler: rpTypes.IntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput): boolean {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'SessionsIntent';
	},
	handle(handlerInput: Alexa.HandlerInput): Response {
		let sessAttrs = handlerInput.attributesManager.getSessionAttributes();

		let foundSessions = sessAttrs.foundSessions;
		let currSessResp: rpTypes.TextResponse = null;
		let speechTxt = null;
		if (foundSessions && foundSessions.length > 0) {
			console.log('SessionsIntentHandler, foundSessions=', foundSessions);
			currSessResp = ResponseGenerator.getSessionsResp(foundSessions, -1);
			speechTxt = currSessResp.textContent.primaryText.text;
			sessAttrs.speechOutput = speechTxt;
			sessAttrs.lastFoundIndex = foundSessions.length > 0 ? 0 : -1;
			handlerInput.attributesManager.setSessionAttributes(sessAttrs);
		}else {
			currSessResp = ResponseGenerator.noSessionsResponse;
			speechTxt = currSessResp.textContent.primaryText.text;
		}
		return handlerInput.responseBuilder
			.speak(speechTxt)
			.withStandardCard(currSessResp.cardTitle, currSessResp.cardText, currSessResp.cardImage)
			.withShouldEndSession(false)
			.getResponse();
	}
};
/**
 * When the user says stop or cancel. Says goodbye and ends the session
 */
const CancelAndStopIntentHandler: rpTypes.IntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput): boolean {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
	},
	handle(handlerInput: Alexa.HandlerInput): Response {
		let resp = ResponseGenerator.cancelStopResponse;
		const speechText = resp.textContent.primaryText.text;

		return handlerInput.responseBuilder
			.speak(speechText)
			.withSimpleCard(resp.cardTitle, speechText)
			.withShouldEndSession(true)
			.getResponse();
	}
};
/**
 * Handler for when help is requested
 */
const HelpIntentHandler: rpTypes.IntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput): boolean {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
	},
	handle(handlerInput: Alexa.HandlerInput): Response {
		let sessAttrs = handlerInput.attributesManager.getSessionAttributes();

		let resp = ResponseGenerator.helpResponse;
		let speechText = resp.textContent.primaryText.text;
		speechText += ' or ' + resp.textContent.secondaryText.text;
		speechText += ' or ' + resp.textContent.tertiaryText.text;
		sessAttrs.speechOutput = speechText;
		handlerInput.attributesManager.setSessionAttributes(sessAttrs);

		return handlerInput.responseBuilder
			.speak(speechText)
			.withSimpleCard(resp.cardTitle, speechText)
			.getResponse();
	}
}
/**
 * This is actually an ALL request interceptor. However, we include a 'canHandle'
 * determination that only actually does anything for the NoIntent.
 * Will fetch the sessions based on the slot values available
 */
const NoRequestInterceptor = {
	process(handlerInput: Alexa.HandlerInput) {
		let requestType = handlerInput.requestEnvelope.request.type;
		if (requestType === 'IntentRequest') {
			let canHandle = false;
			let intent = (<IntentRequest> handlerInput.requestEnvelope.request).intent;
			let intentName = intent.name;
			if (intentName === 'NoIntent') {
				canHandle = true;
			}
			if (canHandle) {
				let sessAttrs = handlerInput.attributesManager.getSessionAttributes();
				if (sessAttrs.slotVals) {
					delete sessAttrs.foundSessions;
					let nextSlotIdx = sessAttrs.nextSlotIdx ? sessAttrs.nextSlotIdx : 0;
					if (nextSlotIdx <= sessAttrs.slotVals.SessionName.length - 1) {
						let slotVals = sessAttrs.slotVals;
						let slotVal = {'SessionName': slotVals['SessionName'][nextSlotIdx]};
						return DataHelper.findSessions(slotVal)
							.then((response) => {
								if (utils.isResponseValid(response)) {
									sessAttrs.foundSessions = response;
									sessAttrs.slotVals = slotVals;
									sessAttrs.nextSlotIdx = nextSlotIdx + 1;
									handlerInput.attributesManager.setSessionAttributes(sessAttrs);
								}
							});
					}
				}
			}
		}
		return null;
	}
}
/**
 * No Intent handler. Will read off the next found session
 */
const NoIntentHandler: rpTypes.IntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput): boolean {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'NoIntent';
	},
	handle(handlerInput: Alexa.HandlerInput): Response {
		let sessAttrs = handlerInput.attributesManager.getSessionAttributes();
		if (!sessAttrs.nextSlotIdx) {
			let lastIdx = sessAttrs.lastFoundIndex;
			let foundSessions = sessAttrs.foundSessions;
			if (lastIdx + 1 === foundSessions.length) { // There are no more
				let speechText = 'Sorry, that\'s all the sessions we found. Please try again';
				return handlerInput.responseBuilder
					.speak(speechText)
					.withShouldEndSession(false)
					.getResponse();
			}else {
				let noResp = ResponseGenerator.getNoResponse(foundSessions, lastIdx);
				let speechTxt = noResp.textContent.primaryText.text;

				sessAttrs.speechOutput = speechTxt;
				sessAttrs.lastFoundIndex = lastIdx + 1;
				return handlerInput.responseBuilder
					.speak(speechTxt)
					.withStandardCard(noResp.cardTitle, noResp.cardText, noResp.cardImage)
					.withShouldEndSession(false)
					.getResponse();
			}
		}else {
			let foundSessions = sessAttrs.foundSessions;
			let noResp = ResponseGenerator.getNoResponse(foundSessions, -1);
			let speechTxt = noResp.textContent.primaryText.text;

			sessAttrs.speechOutput = speechTxt;
			return handlerInput.responseBuilder
				.speak(speechTxt)
				.withStandardCard(noResp.cardTitle, noResp.cardText, noResp.cardImage)
				.withShouldEndSession(false)
				.getResponse();
		}
	}
}
/**
 * Yes Intent handler. Will respond with happiness
 */
const YesIntentHandler: rpTypes.IntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput): boolean {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'YesIntent';
	},
	handle(handlerInput: Alexa.HandlerInput): Response {
		let sessAttrs = handlerInput.attributesManager.getSessionAttributes();
		let yesResp: rpTypes.TextResponse = null;
		let endSess = true;
		if (sessAttrs.foundSessions && sessAttrs.foundSessions.length > 0) {
			yesResp = ResponseGenerator.yesResponse;
			endSess = true;
		}else {
			yesResp = ResponseGenerator.didntUnderstandResponse;
			endSess = false;
		}

		return handlerInput.responseBuilder
			.speak(yesResp.textContent.primaryText.text)
			.withSimpleCard(yesResp.cardTitle, '')
			.withShouldEndSession(endSess)
			.getResponse()
	}
}
/**
 * Repeat Intent handler. Will repeat the last thing spoken
 */
const RepeatIntentHandler: rpTypes.IntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput): boolean {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent';
	},
	handle(handlerInput: Alexa.HandlerInput): Response {
		const sessionAttrs = handlerInput.attributesManager.getSessionAttributes();
		console.log('RepeatIntentHandler, sessionAttrs=', sessionAttrs);
		let speechTxt = sessionAttrs.speechOutput ? sessionAttrs.speechOutput : 'Sorry, there is nothing to repeat';
		console.log('RepeatIntentHandler, speechTxt=', speechTxt);
		return handlerInput.responseBuilder
			.speak(speechTxt)
			.reprompt(speechTxt)
			.getResponse();
	}
}
/**
 * Fired when the a SessionEnded happens
 */
const SessionEndedRequestHandler: rpTypes.IntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput): boolean {
		return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
	},
	handle(handlerInput: Alexa.HandlerInput): Response {
		let speechTxt = 'Goodbye!';
		let handlerReq = (<any> handlerInput.requestEnvelope.request);
		if (handlerReq && handlerReq.error.message) {
			speechTxt = handlerReq.error.message;
		}
		return handlerInput.responseBuilder
			.speak(speechTxt)
			.getResponse();
	}
}
/**
 * When an error occurs. Will end the session
 */
const ErrorHandler: rpTypes.IntentHandler = {
	canHandle(): boolean {
		return true;
	},
	handle(handlerInput, error): Response {
		console.log('ErrorHandler, error=', error);
		let msg = error.message;
		if (msg.includes('requires an index')) {
			msg = 'An index is required for this query';
		}
		return handlerInput.responseBuilder
			.speak('Sorry, an error occurred:' + msg + '. Please say again')
			.withSimpleCard('Sorry, an error occurred: ', error.message)
			.withShouldEndSession(true)
			.getResponse();
	}
}

const skillBuilder = Alexa.SkillBuilders.custom();

export const handler = skillBuilder
	.addRequestInterceptors(
		SessionsRequestInterceptor,
		NoRequestInterceptor
	)
	.addRequestHandlers(
		CancelAndStopIntentHandler,
		GeneralGreetingIntentHandler,
		HelpIntentHandler,
		LaunchRequestHandler,
		NoIntentHandler,
		RepeatIntentHandler,
		SessionEndedRequestHandler,
		SessionsIntentHandler,
		YesIntentHandler
	)
	.addErrorHandlers(ErrorHandler)
	.lambda();
