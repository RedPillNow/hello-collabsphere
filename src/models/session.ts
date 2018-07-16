import { Speaker } from "./speaker";
import * as utils from '../commons/utils';

export class Session {
	_apiObj: any;
	private _session_date: Date;
	private _session_time: string; // start time
	private _session_time2: string; // end time
	private _session_room: string;
	private _session_nr: string;
	private _session_type: string; // $35
	private _session_title: string;
	private _session_abstract: string; // $37
	private _session_speakers: Speaker[];
	private _session_subtype: string; // $36
	private refDate: Date = new Date() < new Date('7/23/2018') || new Date() > new Date('7/25/2018') ? new Date('7/24/2018') : new Date();
	private _deck: string;

	constructor(apiObj) {
		this._apiObj = apiObj;
		this.init();
	}

	init(): void {
		let sessionDate = this.sessionDate;
		let sessionTime = this.sessionTime;
		let sessionTime2 = this.sessionTime2;
		let room = this.sessionRoom;
		let nr = this.sessionNr;
		let type = this.sessionType;
		let title = this.sessionTitle;
		let abs = this.sessionAbstract;
		let speakers = this.speakers;
		// let subType = this.sessionSubtype;
	}

	get apiObj() {
		return this._apiObj;
	}

	get sessionDate() {
		if (!this._session_date && this.apiObj && this.apiObj.document.fields.StartDate) {
			let dateStr = this.apiObj.document.fields.StartDate.stringValue;
			this._session_date = new Date(dateStr);
		}
		return this._session_date;
	}

	set sessionDate(sessionDate) {
		this._session_date = sessionDate;
	}

	get spokenDate() {
		let spokenDate = '';
		if (this.apiObj.document.fields.StartDate) {
			let dateTimeStr = this.apiObj.document.fields.StartDate.stringValue;
			let time = this.sessionTime;
			let unformatTime = time.replace(':','');
			dateTimeStr = dateTimeStr + 'T' + unformatTime;
			dateTimeStr = utils.getSpokenDateText(dateTimeStr, this.refDate);
			dateTimeStr = dateTimeStr.replace(' </say-as>', '</say-as>'); // Get rid of the space
			dateTimeStr = dateTimeStr.replace('"time"> ', '"time">'); // Get rid of the space
			spokenDate = dateTimeStr;
		}
		return spokenDate;
	}

	get cardDate() {
		let spokenDate = '';
		if (this.apiObj.document.fields.StartDate) {
			let dateTimeStr = this.apiObj.document.fields.StartDate.stringValue;
			let time = this.sessionTime;
			let unformatTime = time.replace(':','');
			dateTimeStr = dateTimeStr + 'T' + unformatTime;
			dateTimeStr = utils.getPrintedDateText(dateTimeStr, this.refDate);
			spokenDate = dateTimeStr;
		}
		return spokenDate;
	}

	get sessionTime() {
		if (!this._session_time && this.apiObj && this.apiObj.document.fields.StartTime) {
			this._session_time = this.apiObj.document.fields.StartTime.stringValue;
		}
		return this._session_time;
	}

	set sessionTime(sessionTime) {
		this._session_time = sessionTime;
	}

	get sessionTime2() {
		if (!this._session_time2 && this.apiObj && this.apiObj.document.fields.EndTime) {
			this._session_time = this.apiObj.document.fields.EndTime.stringValue;
		}
		return this._session_time2;
	}

	set sessionTime2(sessionTime2) {
		this._session_time2 = sessionTime2;
	}

	get sessionRoom() {
		if (!this._session_room && this.apiObj && this.apiObj.document.fields.SessionRoom) {
			this._session_room = this.apiObj.document.fields.SessionRoom.stringValue;
		}
		return this._session_room;
	}

	set sessionRoom(sessionRoom) {
		this._session_room = sessionRoom;
	}

	get spokenRoom() {
		let spokenRoom = this.sessionRoom;
		if (!spokenRoom.toLowerCase().includes('room')) {
			spokenRoom += ' Room';
		}
		spokenRoom = spokenRoom.replace('A. ', '');
		spokenRoom = spokenRoom.replace('B. ', '');
		spokenRoom = spokenRoom.replace('C. ', '');
		spokenRoom = spokenRoom.replace('D. ', '');
		spokenRoom = spokenRoom.replace('E. ', '');
		return spokenRoom;
	}

	get sessionNr() {
		if (!this._session_nr && this.apiObj && this.apiObj.document.fields.SessionID) {
			this._session_nr = this.apiObj.document.fields.SessionID.stringValue;
		}
		return this._session_nr;
	}

	set sessionNr(sessionNr) {
		this._session_nr = sessionNr;
	}

	get sessionType() {
		if (!this._session_type && this.apiObj && this.apiObj.document.fields['$35']) {
			this._session_type = this.apiObj.document.fields['$35'].stringValue;
		}
		return this._session_type;
	}

	set sessionType(sessionType) {
		this._session_type = sessionType;
	}

	get sessionTitle() {
		if (!this._session_title && this.apiObj && this.apiObj.document.fieldsAbstractTitle) {
			this._session_title = this.apiObj.document.fieldsAbstractTitle.stringValue;
		}
		return this._session_title;
	}

	set sessionTitle(sessionTitle) {
		this._session_title = sessionTitle;
	}

	get cardTitle() {
		let title = null;
		if (this.sessionTitle) {
			title = this.sessionTitle.replace('&', 'and');
		}
		return title;
	}

	get spokenTitle() {
		let spokenTitle = this.sessionTitle;
		if (this.sessionTitle.indexOf('(') > -1 && this.sessionTitle.indexOf(')') > -1) {
			let regex = /^(?:[\w 0-9-_=&]*)(\(([\w 0-9-_=&]*)\))(?:[\w 0-9-_=&]*)$/;
			let results = spokenTitle.match(regex);
			if (results && results.length > 0) {
				let replaceStr = results[1];
				let replaceTxt = '<emphasis level="strong">' + results[2] + '</emphasis>';
				spokenTitle = spokenTitle.replace(replaceStr, replaceTxt);
			}
		}
		if (this.sessionTitle.indexOf('"') > -1) {
			let regex = /^(?:[\w 0-9-_=&]*)("([\w 0-9-_=&]*)")(?:[\w 0-9-_=&]*)$/;
			let results = spokenTitle.match(regex);
			if (results && results.length > 0) {
				let replaceStr = results[1];
				let replaceTxt = '<emphasis level="strong">' + results[2] + '</emphasis>';
				spokenTitle = spokenTitle.replace(replaceStr, replaceTxt);
			}
		}
		spokenTitle = spokenTitle.replace('&', 'and');
		return spokenTitle;
	}

	get sessionAbstract() {
		if (!this._session_abstract && this.apiObj && this.apiObj.document.fields.SessionText) {
			this._session_abstract = this.apiObj.document.fields.SessionText.stringValue;
		}
		return this._session_abstract;
	}

	set sessionAbstract(sessionAbstract) {
		this._session_abstract = sessionAbstract;
	}

	get speakers() {
		if ((!this._session_speakers || this._session_speakers.length === 0) && this.apiObj) {
			let spkrs = [];
			if (this.apiObj.document.fields.Speaker1.stringValue) {
				let primarySpk = new Speaker();
				primarySpk.name = this.apiObj.document.fields.Speaker1.stringValue
				spkrs.push(primarySpk);
				if (this.apiObj.document.fields.Speaker2.stringValue) {
					let secondSpk = new Speaker();
					secondSpk.name = this.apiObj.document.fields.Speaker2.stringValue;
					spkrs.push(secondSpk);
				}
			}
			this._session_speakers = spkrs;
		}
		return this._session_speakers;
	}

	set speakers(speakers) {
		this._session_speakers = speakers;
	}

	get spokenSpeakers() {
		let spokenSpeakers = '';
		let lastIdx = this.speakers.length - 1;
		for (let i = 0; i < this.speakers.length; i++) {
			let spkr = this.speakers[i];
			if (i === 0) {
				spokenSpeakers = spkr.name;
			} else if (i === lastIdx) {
				spokenSpeakers += ' and ' + spkr.name;
			}else {
				spokenSpeakers += ', ' + spkr.name;
			}
		}
		return spokenSpeakers;
	}

}
