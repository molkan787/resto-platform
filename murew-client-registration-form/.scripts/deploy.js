const child_process = require('child_process');

/**
 * 
 * @param {string} cmd 
 * @param {{ encoding: "buffer" | null; } & child_process.ExecOptions} options 
 * @returns 
 */
function exec(cmd, options){
    return new Promise((resolve, reject) => {
        child_process.exec(cmd, options, (error, stdout, stderr) => {
            if(error) reject(error)
            else resolve({ stdout, stderr })
        });
    });
}

async function run(){
    // console.log('Building app...')
    // await exec('yarn build', { cwd: '~/resto-e-commerce/murew-client-registration-form' })
    console.log('Clearing previously deployed files...')
    try {
        await Promise.all([
            exec('rm -rf ~/murew-presentation-website/registration-form-app/assets'),
            exec('rm ~/murew-presentation-website/registration-form-app/favicon.ico'),
            exec('rm ~/murew-presentation-website/registration-form-app/index.html'),
        ])
    } catch (error) {
        
    }
    console.log('Copying new files...')
    await exec('cp -a ~/resto-e-commerce/murew-client-registration-form/dist/. ~/murew-presentation-website/registration-form-app')
    await exec('cp ~/resto-e-commerce/murew-client-registration-form/top-window.js ~/murew-presentation-website/registration-form-app/assets/top-window.js')
}


run()
.then(() => console.log('Deployment Completed.'))
.catch(err => {
    console.error('DEPLOYMENT FAILED')
    console.error(err)
})