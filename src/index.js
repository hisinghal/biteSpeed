import path from 'path';
import start from './start.js';


const { PORT = 7878 } = process.env;
start.listen(PORT, () => console.log(`Listening on port ${PORT}`));
