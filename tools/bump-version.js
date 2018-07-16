'use strict';

const replace = require('replace');
const fs = require('fs');
const chalk = require('./chalkConfig');

/**
 * Bump the version number in package.json, bower.json and src/settings.json
 *
 * @param {string} versionPart
 * @returns {Promise}
 */
module.exports.bump = function bump(versionPart) {
	return new Promise((resolve, reject) => {
		if (!versionPart) {
			let err = new Error('You must provide a version part to bump');
			reject(err);
		}
		try {
			let currentVersion = _getCurrentVersion();
			let newVersion = _getNewVersion(versionPart);
			console.log(chalk.processing('Bumping version from ' + currentVersion + ' to ' + newVersion + '...'));
			let rep = replace({
				regex: `("version"): "(.*?)"`,
				replacement: `$1: "${newVersion}"`,
				paths: ['package.json'],
				recursive: false,
				silent: true
			});
			console.log(chalk.success('Version bumped to: ' + newVersion));
			resolve(newVersion);
		} catch (e) {
			reject(e);
		}
	});
};
/**
 * Get the current version from package.json
 *
 * @returns {string}
 */
function _getCurrentVersion() {
	let packageContent = fs.readFileSync('package.json');
	let packageJson = JSON.parse(packageContent);
	return packageJson.version;
}
/**
 * Determine the new version based on the level passed
 *
 * @param {string} level - 'major', 'minor' or 'patch'
 * @returns {string} The new version after bumping the level
 */
function _getNewVersion(level) {
	if (!level) {
		throw new Error('No version part specified to _getNewVersion!');
		return;
	}
	let currentVersion = _getCurrentVersion();
	let versionArr = currentVersion.split('.'); // 0=major, 1=minor, 2=patch
	let newVersion = currentVersion;
	if (level === 'patch') {
		versionArr[2] = parseFloat(versionArr[2]) + 1;
	} else if (level === 'minor') {
		versionArr[1] = parseFloat(versionArr[1]) + 1;
		versionArr[2] = 0;
	} else if (level === 'major') {
		versionArr[0] = parseFloat(versionArr[0]) + 1;
		versionArr[1] = 0;
		versionArr[2] = 0;
	}
	newVersion = versionArr.join('.');
	return newVersion;
}
