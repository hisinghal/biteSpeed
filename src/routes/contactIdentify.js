import { Router } from 'express';
import readPool from '../databases/read-pool.js';
import writePool from '../databases/write-pool.js';
import {dataToUpdate, newContactResult, makeResult} from '../utils.js';
const router = Router();


router.post('/identify',async (req, res) => {

	let result = {
		code: '',
		message: '',
	};
let contact = {};

let insertQuery = 'insert into contact (phoneNumber,email,linkPrecedence, linkedid) values (?,?,?,?) ';
let updateQuery = 'UPDATE contact SET linkPrecedence = ? , linkedid = ? where id in (?)';


if(req.body.email == null && req.body.phoneNumber == null) {
	result.code = 400;
	result.message = 'Bad Request';
	res.setHeader('content-type', 'text/json');
	res.send(JSON.stringify(result));
}

else {
	try {
		let email = req.body.email;
		let phoneNumber = req.body.phoneNumber;
		let row = [];
		let query = 'select * from contact where email = ? OR phoneNumber = ?';
		if(email != null && phoneNumber != null)
		row = await readPool.query(query, [req.body.email, req.body.phoneNumber]);

		if(phoneNumber == null)
		{
			query = 'select * from contact where email = ?';
		row = await readPool.query(query, req.body.email);
	}


	if(email == null)	{
		query = 'select * from contact where phoneNumber = ?';
		row = await readPool.query(query, req.body.phoneNumber);
}
		let primaryKeys = new Set();



		if( 0 == row[0].length) { // it is new entry;
			await writePool.query(insertQuery, [phoneNumber, email,"Primary",null]);
			result.contact = await newContactResult(email, phoneNumber);
		}

		else {
			let completeData = [];

			row[0].forEach(contact => {

				if(contact.linkPrecedence == "Primary") {primaryKeys.add(contact.id);}
				else if (contact.linkPrecedence == "Secondary") {primaryKeys.add(contact.linkedid);}
			 });



 			 let primaryKeyQuery = "select * from contact where (id in (?) AND linkPrecedence = ?) " +
 			 "OR (linkedid in (?) AND linkPrecedence = ?)";

 			 completeData = await readPool.query(primaryKeyQuery, [Array.from(primaryKeys), "Primary", Array.from(primaryKeys), "Secondary"]);

			let toUpdate = await dataToUpdate(completeData[0], phoneNumber, email);

				if(toUpdate.contactToModify.length != 0)
				await writePool.query(updateQuery,["Secondary", toUpdate.primaryContact.id, toUpdate.contactToModify]);


			let primaryContact = toUpdate.primaryContact;
			if(toUpdate.toInsert)
			await writePool.query(insertQuery, [phoneNumber, email,"Secondary",primaryContact.id]);
			result.contact = await makeResult(primaryContact);


		}


	result.code = 200;
	result.message = 'Query successful';
	res.setHeader('content-type', 'text/json');
	res.send(JSON.stringify(result));

} catch(error) {
console.log(error);


	result.code = 500;
result.message = 'Server Error';
res.setHeader('content-type', 'text/json');
res.send(JSON.stringify(result));
			}
	}
});

export default router;
