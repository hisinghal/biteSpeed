import mysql from 'mysql2/promise';

const readPool = mysql.createPool({
	host: '127.0.0.1',
	port: '3306',
	user: '14112039',
	password: '14112039Hs@',
	multipleStatements: true,
	database: 'bitespeed',
	timezone: 'ist',
	charset: 'utf8mb4',
});

export default readPool;
