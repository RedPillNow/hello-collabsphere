# hello-engage Alexa Skill

This is the hello-engage Alexa skill. It is meant to demonstrate surfacing data from Domino via Alexa. It is mainly meant to be used like a kiosk to ask about sessions occurring during Engage 2018 in Rotterdam.

## Usage

The invocation phrase is still being developed. However, once past the invocation we have the following phrases to search for sessions:

### Sessions

This performs a query on a Firebase Cloud Firestore database (See Relevant Links). If no SLOT values are encountered or delivered with the request, will respond with sessions coming up or happening next.

* which sessions are up next
* what sessions are up next
* what are the upcoming sessions
* get upcoming sessions
* get sessions happening at {AMAZON.TIME}
* show sessions happening at {AMAZON.TIME}
* which sessions are happening at {AMAZON.TIME}
* get sessions beginning at {AMAZON.TIME}
* show sessions beginning at {AMAZON.TIME}
* get the {AMAZON.TIME} sessions
* get sessions at {AMAZON.TIME}
* show sessions at {AMAZON.TIME}
* get sessions by {AMAZON.Person}
* show sessions by {AMAZON.Person}
* when is {AMAZON.Person} speaking
* get sessions in {AMAZON.Room}
* show sessions in {AMAZON.Room}
* which sessions are in {AMAZON.Room}
* get sessions by {AMAZON.Organization}
* show sessions by {AMAZON.Organization}
* get sessions about {SessionName}

### Deck

Will inform person asking which deck a room is on

* which deck is {AMAZON.Room} on
* what deck is {AMAZON.Room} on
* where is {AMAZON.Room}

### Help

* some assistance please
* I need help
* help
* how do I use this
* I need some help
* help me

### Greeting

Will deliver a random greeting, some even in other languages. Currently there are 7 greetings which are randomly chosen.

* hello
* hello red pill
* hello engage
* greetings
* howdy
* howdy red pill
* hey
* what's up
* what's happening

### Repeat

Will repeat the last thing said

* repeat
* say that again
* say again
* what did you say
* repeat that

### No

Used to answer if the read session is the one the user was looking for

* negative
* that's not it
* nope
* not this one
* not that one
* no

### Yes

Used to answer if the read session is the one the user was looking for. When used, will end the session.

* affirmative
* that's the one
* yup that's it
* yes that's it
* ok
* yup
* yes


### Cancel

Stops and Ends the session.

* cancel
* stop

## Requirements

The following is required to develop for this skill.

* [nodejs 4.3 or greater](https://nodejs.org/en/)
* [ask-sdk](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs)
* [ask-sdk-core](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs)
* [ask-sdk-model](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs)
* [firebase-admin](https://www.npmjs.com/package/firebase-admin)
* [request](https://www.npmjs.com/package/request)
* [request-promise](https://www.npmjs.com/package/request-promise)
* [moment](https://www.npmjs.com/package/moment)
* [TypeScript 2.8.3](https://www.npmjs.com/package/typescript)
* [stopwords](https://github.com/huned/node-stopwords)

## NPM Tasks

The following tasks are available. More information can be found in `package.json`.

* `bump:major` - Bump the `package.json` major version number
* `bump:minor` - Bump the `package.json` minor version number
* `bump:patch` - Bump the `package.json` patch version number
* `clean-js` - Remove all .js and .map files within the dist directory
* `compile` - Compile all TypeScript to JavaScript and place in the dist directory
* `deploy` - run the `compile` task, create a `hello-engage-alexa-skill.zip` file and include `node_modules` and `package.json`

## Node Scripts

The following node scripts are included in this project

* `bump-version.js` - Bumps the version numbers
* `chalkConfig.js` - Configuration for chalk colors
* `cleanCompilerFiles.js` - Deletes .js and .map files
* `compileTs.js` - Compiles TypeScript based on `tsconfig.json`
* `deploy.js` - Zips up and deploys files to `AWS Lambda`
* `firestore-import.js` - Imports the `firebase-entries-import.json` file into `Firestore`. Uses `hello-engage-a735c55c95c7.json` for authentication. That file is the private/public key for a service account.
* `sessions-parser.js <fieldToReturn> <outputFileName>` - Will scan each session from `firebase-entries-import`, look at the field passed in, remove all the stop words from the value of the field and create `SLOT` values for that field and dump them to the `outputFileName` or if no output file is defined to the console

## Relevant Links

This skill uses AWS Lambda along with the Alexa Developer Console.

* `hello-engage` [AWS Lambda Function](https://us-west-2.console.aws.amazon.com/lambda/home?region=us-west-2#/functions/hello-engage-alexa-skill?tab=graph)
* `hello-engage` [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask/build/custom/amzn1.ask.skill.70a2dcc9-453d-4786-979d-3231c79d76dc/development/en_US/dashboard)
* AWS Lambda ARN: `arn:aws:lambda:us-west-2:215532694292:function:hello-engage-alexa-skill`
* Alexa App ID: `amzn1.ask.skill.70a2dcc9-453d-4786-979d-3231c79d76dc`
* `firebase cloud firestore` [hello-engage-69ff8](https://console.firebase.google.com/u/1/project/hello-engage-69ff8/overview)
