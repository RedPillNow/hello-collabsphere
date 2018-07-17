import { Slot } from 'ask-sdk-model';
import * as rpTypes from './types';
import * as moment from 'moment';
import * as rp from 'request-promise';

/**
 * Perform an xhrRequest
 * @param options The xhrOptions to peform an xhr request
 * @returns {Promise<any>}
 */
export function doRequest(options: rpTypes.XhrOptions): Promise<any> {
	options.json = options.json == null || options.json === undefined ? true : options.json;
	options.method = options.method || 'GET';
	options.headers = options.headers || {};
	options.resolveFullResponse = options.resolveFullResponse === null || options.resolveFullResponse === undefined ? true : options.resolveFullResponse;
	if (options.userName && options.password && !options.headers.Authorization) {
		options.headers.Authorization = 'Basic a2VpdGggc3RyaWNrbGFuZDp0ZXN0MTIz';
		options.headers['User-Agent'] = options.headers['User-Agent'] ? options.headers['User-Agent'] : 'Request-Promise';
	}
	console.log('Utils.doRequest options=', options);
	return rp(options);
}
/**
 * Get the valid slot values
 * @param slots the object of slots provided in the handlerInput
 * @returns {any}
 * @todo: need to make this a little more robust instead of assuming different things are
 * actually there
 */
export function getSlotValues(slots, acceptMultiple?) {
	let returnVal = null;
	acceptMultiple = acceptMultiple === null || acceptMultiple === undefined ? false : acceptMultiple;
	if (slots) {
		for (let key in slots) {
			let slot: Slot = slots[key];
			if (slot.value && !slot.resolutions) {
				returnVal = returnVal || {};
				returnVal[slot.name] = slot.value;
			}else if (slot.value && slot.resolutions) {
				let resolutions = slot.resolutions;
				let resolutionsAuthority = resolutions.resolutionsPerAuthority;
				returnVal = returnVal || {};
				if (resolutionsAuthority && resolutionsAuthority.length > 0) {
					if (resolutionsAuthority[0].values && resolutionsAuthority[0].values.length > 0) {
						if (!acceptMultiple || resolutionsAuthority[0].values.length === 1) {
							returnVal[slot.name] = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
						}else {
							let slotValArr = [];
							for (let i = 0; i < resolutionsAuthority[0].values.length; i++) {
								slotValArr.push(resolutionsAuthority[0].values[i].value.name);
							}
							returnVal[slot.name] = slotValArr;
						}
					}else {
						returnVal[slot.name] = slot.value;
					}
				}else {
					returnVal[slot.name] = slot.value;
				}
			}
		}
	}
	return returnVal;
}
/**
 * Determine if a response is valid or not. Even when there
 * are no records returned from firebase there is an array with
 * one object in it with just a readtime
 * @param {any[]} response The response from firebase
 * @returns {boolean}
 */
export function isResponseValid(response): boolean {
	if (!response) {
		return false;
	} else if (response && Array.isArray(response)) {
		return response.length > 0 && response[0].document ? true : false;
	}
	return true;
}
/**
 * Convert a string to proper case, used mainly for names
 * @param {string} str
 * @returns {string}
 */
export function toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
/**
 * The the nearest quarter hour based on the current time
 * @returns {string}
 */
export function getNearestQuarterHour(): number {
	let now = new Date() < new Date('7/23/2018') || new Date() > new Date('7/25/2018') ? new Date('7/22/2018') : new Date();
	let minutes = now.getMinutes();
	if (minutes < 7) {
		minutes = 0;
	}else if (minutes < 22) {
		minutes = 15;
	}else if (minutes < 37) {
		minutes = 30;
	}else if (minutes < 52) {
		minutes = 45;
	}else {
		minutes = 0;
	}
	return minutes;
}
/**
 * Get the spoken date like 'Tomorrow at 1:30 PM'
 * @param {string} dateTimeStr a dateTime String
 * @param {string} refDate a reference date (i.e. what session date should we mimick)
 */
export function getSpokenDateText(dateTimeStr, refDate?) {
	// console.log('Utils.getSpokenDateText, args=', arguments);
	let evtMoment: moment.Moment = moment(dateTimeStr);
	let evtCal = evtMoment.calendar();
	if (refDate) {
		evtCal = evtMoment.calendar(refDate)
	}
	let dateTimeArr = evtCal.split(' ');
	dateTimeArr.splice(2, 0, '<say-as interpret-as="time">');
	dateTimeArr.push('</say-as>');
	// console.log('Utils.getSpokenDateText, dateTimeArr=', dateTimeArr);
	let dateTimeText = dateTimeArr.join(' ');
	// console.log('Utils.getSpokenDateText, dateTimeText=', dateTimeText);
	return dateTimeText;
}
/**
 * Similar to getSpokenDateText however we don't include the "say-as" tag
 * @param dateTimeStr a dateTime string
 * @param refDate a reference date (i.e. what session date should we mimick)
 */
export function getPrintedDateText(dateTimeStr, refDate?) {
	let evtMoment: moment.Moment = moment(dateTimeStr);
	let evtCal = evtMoment.calendar();
	if (refDate) {
		evtCal = evtMoment.calendar(refDate)
	}
	let dateTimeArr = evtCal.split(' ');
	let dateTimeText = dateTimeArr.join(' ');
	return dateTimeText;
}
