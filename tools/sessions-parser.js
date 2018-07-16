/**
 * This script will parse the `firebase-entries-import.json` file and
 * pull out the relevant values for whatever fieldname is passed into
 * the script via arguments.
 *
 * This is used to build an array of slot values
 */
const fs = require('fs');
const path = require('path');
const chalk = require('./chalkConfig');
const entries = require('../firebase-entries-import.json');
let stopwords = require('stopwords').english;

let fieldToReturn = process.argv[2];
let outputFileName = process.argv[3];

stopwords = stopwords.concat(['IBM','panagenda','panagenda:','Now:','AppFusions:','the','become','an','using']);
let slotVals = [];
let synonyms = [];
if (fieldToReturn) {
	slotVals = entries.map((item, idx, arr) => {
		let val = getFieldVal(item);
		syns = getSynonyms(val);
		synonyms = synonyms.concat(syns);
		return {
			name: {
				value: val,
				synonyms: syns
			}
		};
	});
}else {
	console.log(chalk.error('No field was defined!'));
	process.exit();
}
if (outputFileName) {
	let fileName = path.join(__dirname, outputFileName);
	let file = fs.createWriteStream(fileName);
	file.on('error', (err) => {
		console.log(chalk.error(err));
	});
	file.write(JSON.stringify(slotVals));
	file.end();
	console.log(chalk.success('Finished writing ' + fileName));
}else {
	console.log(chalk.warning('No output file was defined, just printing to the console.'));
	console.log(JSON.stringify(slotVals, 'utf-8', 4));
	process.exit();
}

function getFieldVal(entry) {
	let val = null;
	if (entry) {
		let entVal = entry.entrydata.filter((item, idx, arr) => {
			return item['@name'] === fieldToReturn;
		});
		if (entVal) {
			if (entVal[0].datetime) {
				val = entVal[0].datetime['0'];
			}else {
				val = entVal[0].text['0'];
			}
		}
	}
	return val;
}

function getSynonyms(val) {
	let syns = [];
	if (val) {
		val = val.replace(/([-_–])/g, '');
		let wordArr = val.split(' ');
		for (let i = 0; i < wordArr.length; i++) {
			let word = wordArr[i];
			word = word.replace(/(["':`\!\?.,$@&\*\(\)#])/g, '');
			let numRegEx = /[0-9]/g;
			let isNum = numRegEx.test(word);
			if (stopwords.indexOf(word) === -1 && stopwords.indexOf(word.toLowerCase()) === -1 && !isNum) {
				let wordAlreadyUsed = alreadyUsed(word);
				if (!wordAlreadyUsed) {
					syns.push(word.toLowerCase());
				}
			}
		}
	}
	return syns;
}

function alreadyUsed(word) {
	return synonyms.indexOf(word.toLowerCase()) > -1;
}
