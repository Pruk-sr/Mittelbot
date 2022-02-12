const {exec} = require('child_process');

async function getLinesOfCode(cb) {
    exec('git ls-files | xargs wc -l', (err, stdout, stderr) => {
        if(err) {
            console.log(err);
        }
        let array = stdout.split(' ');
        let i = stdout.length;
        while(i > 0) {
            if(!isNaN(array[i])) {
                return cb(array[i]);
            }else {
                i--;
            }
        }
        
    });
}
module.exports = {getLinesOfCode};