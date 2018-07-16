import * as rpTypes from '../commons/types';
import * as utils from '../commons/utils';
import * as moment from 'moment';
import {Speaker} from '../models/speaker';

export enum RequestType {
	ByRoom, BySpeaker, ByTime, ByOrg, BySession
}

export class DataHelper {

	static fields: rpTypes.FirestoreQueryField[] = [
		{'fieldPath': 'session_title'},
		{'fieldPath': 'session_date'},
		{'fieldPath': 'session_time1'},
		{'fieldPath': 'session_room'},
		{'fieldPath': '`$37`'},
		{'fieldPath': 'speaker_name'},
		{'fieldPath': 'speaker_org'},
		{'fieldPath': 'speaker_photourl'},
		{'fieldPath': 'speaker_logo'},
		{'fieldPath': 'speaker_profile'},
		{'fieldPath': 'speaker_name2'},
		{'fieldPath': 'speaker_org2'},
		{'fieldPath': 'speaker_photourl2'},
		{'fieldPath': 'speaker_logo2'},
		{'fieldPath': 'speaker_profile2'},
		{'fieldPath': 'speaker_name3'},
		{'fieldPath': 'speaker_org3'},
		{'fieldPath': 'speaker_photourl3'},
		{'fieldPath': 'speaker_logo3'},
		{'fieldPath': 'speaker_profile3'},
		{'fieldPath': 'speaker_name4'},
		{'fieldPath': 'speaker_org4'},
		{'fieldPath': 'speaker_photourl4'},
		{'fieldPath': 'speaker_logo4'},
		{'fieldPath': 'speaker_profile4'},
		{'fieldPath': 'speaker_name5'},
		{'fieldPath': 'speaker_photourl5'},
		{'fieldPath': 'speaker_logo5'},
		{'fieldPath': 'speaker_profile5'}
	];

	static fetchAllSessionsData() {
		let opts: rpTypes.XhrOptions = {
			method: 'GET',
			uri: 'https://firestore.googleapis.com/v1beta1/projects/hello-collabsphere/databases/(default)/documents/sessions',
			resolveFullResponse: true,
			json: true
		}
		return utils.doRequest(opts);
	}
	/**
	 * Query firebase for sessions based on the values given in slots
	 * @param {any} sessions The sessions JSON object
	 * @param {any} slots The values in the slots
	 * @property {string} slots.AMAZON.TIME The time from a request
	 * @property {string} slots.AMAZON.Room The room name from a request
	 * @property {string} slots.SessionName The name of a session from a request
	 * @property {string} slots.AMAZON.Person The name of a presenter from a request
	 * @returns {Session[]}
	 */
	static findSessions(slots: any): Promise<any> {
		console.log('ResponseGenerator.findSessions, slots=', slots);
		let opts = this.getRequestOptions();
		if (slots) {
			if (slots['AMAZON.Person']) {
				let speaker = new Speaker();
				speaker.name = utils.toTitleCase(slots['AMAZON.Person']);
				opts.body = DataHelper.getQueryParams(RequestType.BySpeaker, speaker.name);
			} else if (slots['AMAZON.TIME']) {
				opts.body = DataHelper.getQueryParams(RequestType.ByTime, slots['AMAZON.TIME']);
			} else if (slots['AMAZON.Room']) {
				let room = slots['AMAZON.Room'];
				opts.body = DataHelper.getQueryParams(RequestType.ByRoom, room);
			} else if (slots['SessionName']) {
				let sessName = slots['SessionName'];
				opts.body = DataHelper.getQueryParams(RequestType.BySession, sessName);
			} else if (slots['AMAZON.Organization']) {
				let org = slots['AMAZON.Organization'];
				opts.body = DataHelper.getQueryParams(RequestType.ByOrg, org);
			}
			console.log('ResponseGenerator.findSessions, body=', JSON.stringify(opts.body));
		} else {
			let now = new Date() < new Date('7/23/2018') || new Date() > new Date('7/25/2018') ? new Date('7/24/2018') : new Date();
			let mom = moment(now);
			let dateOnlyValue = mom.format('YYYYMMDD');
			let nearestQuarter = utils.getNearestQuarterHour();
			mom.minute(nearestQuarter);
			let startTimeValue = mom.format('kk:mm');
			opts.body = DataHelper.getQueryParams(RequestType.ByTime, startTimeValue);
		}
		return utils.doRequest(opts);
	}
	/**
	 * Get the body of a request which contains a query to be sent to firestore
	 * @param requestType The type of request
	 * @param searchValue The value we're searching for
	 * @returns {rpTypes.FirestoreQuery}
	 */
	static getQueryParams(requestType: RequestType, searchValue: string): rpTypes.FirestoreQuery {
		let body: rpTypes.FirestoreQuery = {};
		let structQuery: rpTypes.FirestoreStructuredQuery = {
			select: {fields: this.fields},
			from: {collectionId: 'sessions'},
			where: null
		};
		if (requestType !== null && requestType !== undefined && searchValue) {
			structQuery.where = {
				compositeFilter: {
					filters: DataHelper.getCompositeFilters(requestType, searchValue),
					op: 'AND'
				}
			};
			body.structuredQuery = structQuery;
		}
		return body;
	}
	/**
	 * Get the composite filters of a firestore compositeQuery
	 * @param requestType The type of request
	 * @param searchValue The value we're searching for
	 * @returns {any[]}
	 */
	static getCompositeFilters(requestType: RequestType, searchValue): any[] {
		let compFilters = [];
		let now = new Date() < new Date('7/23/2018') || new Date() > new Date('7/25/2018') ? new Date('7/24/2018') : new Date();
		switch (+requestType) {
			case RequestType.ByRoom:
				console.log('DataHelper.getCompositeFilters, by room');
				compFilters.push({
					fieldFilter: {
						field: {fieldPath: 'SessionRoom'},
						op: 'EQUAL',
						value: {stringValue: searchValue}
					}
				});
				compFilters = compFilters.concat(this.getFilterRestraint(now));
				break;
			case RequestType.BySpeaker:
				console.log('DataHelper.getCompositeFilters, by speaker');
				compFilters.push({
					fieldFilter: {
						field: {fieldPath: 'Speaker1'},
						op: 'EQUAL',
						value: {stringValue: searchValue}
					}
				});
				compFilters = compFilters.concat(this.getFilterRestraint(now))
				compFilters.splice(2, 1);
				compFilters[1].fieldFilter.op = 'GREATER_THAN_OR_EQUAL';
				break;
			case RequestType.ByTime:
				console.log('DataHelper.getCompositeFilters, by time');
				let mom = moment(now);
				mom.minute(mom.minute() + 60);
				let untilTimeValue = mom.format('kk:mm');
				compFilters = this.getFilterRestraint(now);
				compFilters.push({fieldFilter: {
					field: {fieldPath: 'StartTime'},
					op: 'LESS_THAN_OR_EQUAL',
					value: {stringValue: untilTimeValue}
				}});
				break;
			case RequestType.ByOrg:
				console.log('DataHelper.getCompositeFilters, by org');
				compFilters.push({
					fieldFilter: {
						field: {fieldPath: 'speaker_org'},
						op: 'EQUAL',
						value: {stringValue: searchValue}
					}
				});
				compFilters = compFilters.concat(this.getFilterRestraint(now));
				break;
			case RequestType.BySession:
				console.log('DataHelper.getCompositeFilters, by sessionName');
				compFilters.push({
					fieldFilter: {
						field: {fieldPath: 'AbstractTitle'},
						op: 'EQUAL',
						value: {stringValue: searchValue}
					}
				});
				break;
		}
		return compFilters;
	}
	/**
	 * returns an array containing the field filters to restrict a query to return
	 * values just for today after the current time
	 * @param now The date/time for now
	 * @returns {any[]}
	 */
	static getFilterRestraint(now): any[] {
		let mom = moment(now);
		let dateOnlyValue = mom.format('YYYYMMDD');
		if (mom.hour() > 0 && mom.hour() < 8) {
			mom.hour(mom.hour() + 12);
		}
		let startTimeValue = mom.format('kk:mm');
		let returnVal = [{
			fieldFilter: {
				field: {fieldPath: 'StartDate'},
				op: 'EQUAL',
				value: {stringValue: dateOnlyValue}
			}
		},{
			fieldFilter: {
				field: {fieldPath: 'StartTime'},
				op: 'GREATER_THAN_OR_EQUAL',
				value: {stringValue: startTimeValue}
			}
		}];
		return returnVal;
	}
	/**
	 * Gets a basic `request-promise` options object without a body
	 * @returns {rpTypes.XhrOptions}
	 */
	static getRequestOptions(): rpTypes.XhrOptions {
		return {
			method: 'POST',
			uri: 'https://firestore.googleapis.com/v1beta1/projects/hello-collabsphere/databases/(default)/documents:runQuery',
			resolveFullResponse: true,
			json: true
		};
	}

}
