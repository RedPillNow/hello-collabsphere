/**
 * This uses the aws-cli which must be installed locally and provided
 * with your authentication credentials. If you intend to use this
 * personally you will need to update the following:
 * zipFilePath = What you want your zip file to be named
 * functionName = What you name your Lambda function in AWS
 */
'use strict';

const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const chalk = require('./chalkConfig');
const { exec } = require('child_process');

const zipFilePath = './hello-collabsphere-alexa-skill.zip';
const zipFile = path.basename(zipFilePath);
const functionName = 'hello-collabsphere-alexa-skill';

console.log(chalk.processing('Preparing to deploy your skill...'));

if (fs.existsSync(zipFilePath)) {
	console.log(chalk.processing('deleting ' + zipFilePath));
	fs.unlinkSync(zipFilePath);
}

let output = fs.createWriteStream(zipFilePath);
let archive = archiver('zip', {
	zlib: { level: 9 }
});

// Setup the events
output.on('data', function () {
	console.log(chalk.processing('Zipping files...'));
});

output.on('close', function () {
	console.log(chalk.success(archive.pointer() + ' total bytes'));
	console.log(chalk.success('Zip file ' + zipFile + ' created!'));
	const awsCommand = 'aws lambda update-function-code --function-name ' + functionName + ' --zip-file fileb://' + zipFile
	console.log(chalk.processing('deploying to: ', awsCommand));
	exec(awsCommand, function (err, stdOut, stdErr) {
		if (err) {
			throw err;
		} else if (stdErr) {
			console.log(chalk.error(stdErr));
			throw new Error(stdErr);
		} else {
			console.log(chalk.processing('Deployment Info'));
			console.log(chalk.success(stdOut));
			let deployTime = new Date();
			console.log(chalk.success('Deployment Done: ' + deployTime.toDateString() + ' ' + deployTime.toLocaleTimeString()));
		}
	});
});

output.on('end', function () {
	console.log('output.on end', arguments);
});
archive.on('error', function (err) {
	console.log('archive.on error', err);
	throw err;
});

// Start compressing
console.log(chalk.processing('Zipping up files...'));
archive.pipe(output);
archive.directory('./dist', false);
archive.directory('./node_modules', true);
archive.file('./package.json', {name: 'package.json'});
archive.file('./src/hello-engage-a735c55c95c7.json', {name: 'hello-engage-a735c55c95c7.json'});
archive.finalize();
