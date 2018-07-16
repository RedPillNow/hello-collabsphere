const admin = require('firebase-admin');

const  serviceAccount = require('../hello-collabsphere-firebase-adminsdk-yrmee-7641a91fd2.json');
const entries = require('../firebase-entries-import.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

for (let i = 0; i < entries.length; i++) {
	let ent = entries[i];
	let docRef = db.collection('sessions').doc(ent['@unid']);
	let doc = {};
	for (let j = 0; j < ent.entrydata.length; j++) {
		let fld = ent.entrydata[j];
		let val = fld.datetime ? fld.datetime['0'] : fld.text ? fld.text['0'] : null;
		doc[fld['@name']] = val;
	}
	docRef.set(doc);
}
