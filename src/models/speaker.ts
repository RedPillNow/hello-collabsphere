export class Speaker {
	private _name: string;
	private _org: string;
	private _photoUrl: string;
	private _logoUrl: string;
	private _profile: string;
	private _location: number;

	constructor() {

	}

	get name() {
		return this._name;
	}

	set name(name) {
		this._name = name;
	}

	get org() {
		return this._org;
	}

	set org(org) {
		this._org = org;
	}

	get photoUrl() {
		return this._photoUrl;
	}

	set photoUrl(photoUrl) {
		this._photoUrl = photoUrl;
	}

	get logo() {
		return this._logoUrl;
	}

	set logo(logoUrl) {
		this._logoUrl = logoUrl;
	}

	get location() {
		return this._location;
	}

	set location(location) {
		this._location = location;
	}

	get profile() {
		return this._profile;
	}

	set profile(profile) {
		this._profile = profile;
	}
}
