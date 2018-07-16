import * as Alexa from 'ask-sdk-core';
import * as rpTypes from './types';
import {Session} from '../models/session';
import * as utils from './utils';

export class ResponseGenerator {

	static get launchResponse(): rpTypes.TextResponse {
		return {
			textContent: new Alexa.PlainTextContentHelper()
				.withPrimaryText('Welcome to Hello Engage, Ask me to find sessions for Engage 2018')
				.getTextContent(),
			cardTitle: 'Welcome to Hello Engage'
		};
	}

	static get generalGreetingResponse(): rpTypes.TextResponse {
		const greetingArr = [
			'Hello, Thank you for trying "Hello Engage" from Red Pill Now.',
			'Hi, Welcome to Engage 2018. Enjoy the conference',
			'Howdy! This is "Hello Engage"! I can help you find sessions to attend, give me a try.',
			'Hola! ¡Esto es hola participar! Disfruta la conferencia',
			'Hej! Dette er hej engagere! Nyd konferencen',
			'Bu merhaba meşgul! Konferansın tadını çıkar',
			'Hallå! Detta är hej engagera! Njut av konferensen'
		]
		let msg = greetingArr[Math.floor(Math.random() * greetingArr.length)];
		return {
			textContent: new Alexa.PlainTextContentHelper()
				.withPrimaryText(msg)
				.getTextContent(),
			cardTitle: 'Hello from Hello Engage'
		};
	}

	static get cancelStopResponse(): rpTypes.TextResponse {
		return {
			textContent: new Alexa.PlainTextContentHelper()
				.withPrimaryText('Goodbye! Thank you for trying "Hello Engage"')
				.getTextContent(),
			cardTitle: 'Thank you, Goodbye!'
		};
	}

	static get helpResponse(): rpTypes.TextResponse {
		return {
			textContent: new Alexa.PlainTextContentHelper()
				.withPrimaryText('Ask me to find sessions by time, person or room name.')
				.withSecondaryText('For Example: get sessions by Jason Gary.')
				.withTertiaryText('Get today\'s sessions')
				.getTextContent(),
			cardTitle: 'Hello Engage Help'
		};
	}

	static get yesResponse(): rpTypes.TextResponse {
		return {
			textContent: new Alexa.PlainTextContentHelper()
				.withPrimaryText('Excellent! Enjoy the session')
				.getTextContent(),
			cardTitle: 'Excellent! Enjoy the session'
		};
	}

	static getNoResponse(foundSessions, lastIdx): rpTypes.TextResponse {
		console.log('ResponseGenerator.getNoResponse', arguments);
		return ResponseGenerator.getSessionsResp(foundSessions, lastIdx);
	}

	static getSessionsResp(foundSessions: any[], lastIdx: number): rpTypes.TextResponse {
		// console.log('ResponseGenerator.getSessionsResp, lastIdx=', lastIdx);
		if (foundSessions && foundSessions.length > 0) {
			let nextIdx = lastIdx + 1;
			let sess: Session = null;
			if (foundSessions[nextIdx] instanceof Session) {
				// console.log('ResponseGenerator.getSessionsResp, got a Session');
				sess = foundSessions[nextIdx];
			}else {
				// console.log('ResponseGenerator.getSessionsResp, create a Session');
				let apiObj = foundSessions[nextIdx]._apiObj ? foundSessions[nextIdx]._apiObj : foundSessions[nextIdx];
				sess = new Session(apiObj);
			}
			let spokenText = sess.spokenTitle;
			spokenText += ' by ' + sess.spokenSpeakers;
			spokenText += ', in the ' + sess.spokenRoom;
			spokenText += ', ' + sess.spokenDate + '.';
			spokenText += ' Is this the one you\'re looking for?';
			let cardText = sess.sessionTitle;
			cardText += ' by ' + sess.spokenSpeakers;
			cardText += ', in the ' + sess.sessionRoom;
			cardText += ', ' + sess.cardDate + '.';
			cardText += ' Is this the one you\'re looking for?';
			let resp = {
				textContent: new Alexa.PlainTextContentHelper()
					.withPrimaryText(spokenText)
					.getTextContent(),
				cardTitle: sess.cardTitle,
				cardText: cardText,
				cardImage: sess.speakers && sess.speakers[0] ? sess.speakers[0].photoUrl : null
			};
			return resp;
		}else {
			return {
				textContent: new Alexa.PlainTextContentHelper()
					.withPrimaryText('We didn\'t find any sessions that match your request. Please try again.')
					.getTextContent(),
				cardTitle: 'Don\'t shoot the messenger, but we couldn\'t find any sessions'
			}
		}
	}

	static get noSessionsResponse(): rpTypes.TextResponse {
		return {
			textContent: new Alexa.PlainTextContentHelper()
				.withPrimaryText('I don\'t have any sessions, please try again')
				.getTextContent(),
			cardTitle: 'I don\'t have any sessions, please try again',
			cardText: 'I didn\'t find any sessions'
		};
	}

	static get didntUnderstandResponse(): rpTypes.TextResponse {
		return {
			textContent: new Alexa.PlainTextContentHelper()
				.withPrimaryText('<emphasis level="strong">hmmm</emphasis>, maybe I didn\'t understand what you really said.')
				.getTextContent(),
			cardTitle: 'Maybe I didn\'t understand what you said',
			cardText: 'I didn\'t understand what you said. Please try again.'
		};
	}

	static getDeckResponse(roomName: string): rpTypes.TextResponse {
		let deck = utils.getDeck(roomName);
		let txt = null;
		if (!deck) {
			txt = '<emphasis level="strong">hmmm</emphasis>, I don\'t know that room, please try again';
		}else {
			let spokenRoom = roomName;
			if (roomName.toLowerCase().indexOf('room') === -1) {
				if (roomName.toLowerCase().indexOf('theater') === -1) {
					spokenRoom = roomName + ' room ';
				}
			}
			txt = 'The ' + spokenRoom + ' is located on the ' + deck;
		}
		return {
			textContent: new Alexa.PlainTextContentHelper()
				.withPrimaryText(txt)
				.getTextContent(),
			cardTitle: deck,
			cardText: txt
		};
	}

}
