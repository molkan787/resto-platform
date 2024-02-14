const DATABASE_URI = 'mongodb://root:murew_is_magic@localhost:27018'
const MASTER_BACKEND_DB_NAME = 'admin'

const apps = [
  {
    name: 'supervisor',
    cwd: './supervisor',
    script: 'index.js',
    env: {
      'PUBLIC_IP': '127.0.0.1',
      'DATABASE_URI': DATABASE_URI,
      'MASTER_BACKEND_DB_NAME': MASTER_BACKEND_DB_NAME
    }
  },
  {
    name: 'murew-backend',
    cwd: './murew-backend',
    script: 'server.js',
    env: {
      'DATABASE_URI': `${DATABASE_URI}/admin`
    }
  },
  {
    name: 'apps-builder-agent',
    cwd: './apps-builder-agent',
    script: 'index.js',
    interpreter: '/root/.nvm/versions/node/v20.10.0/bin/node',
    env: {
      'DATABASE_URI': DATABASE_URI,
      'MOBILE_CLIENT_PROJECT_DIR': '/root/Murew',
      'MASTER_BACKEND_DB_NAME': MASTER_BACKEND_DB_NAME,
      'ANDROID_SIGING_STORE_FILE': '/root/platform_data/keys/mobile-storefront-android-upload-keystore.jks',
      'ANDROID_SIGING_KEY_ALIAS': 'mobile-storefront-upload'
    }
  },
  {
    name: 'nginx-reverseproxy-client',
    cwd: './nginx-reverseproxy-client',
    script: 'index.js'
  },
]

// ---------------------------------------------------------------------

const { exec: native_exec } = require('child_process');
const path = require('path');

/**
 * @param {string} cmd 
 * @param {({ encoding: "buffer" | null; } & import('child_process').ExecOptions)?} options 
 */
const exec = function (cmd, options) {
  return new Promise((resolve, reject) => {
      const cb = (error, stdout, stderr) => {
          if(error) reject(error);
          else resolve({ stdout, stderr });
      }
      if(options){
          native_exec(cmd, options, cb)
      }else{
          native_exec(cmd, cb)
      }
  })
}

async function run(){
  const cmd = process.argv[2]
  if(cmd === 'boot'){

    let successCount = 0
    const bootResult = []
    for(let app of apps){
      try {
        const envs = Object.entries(app.env || {}).map(e => `${e[0]}=${e[1]}`).join(' ')
        const envs_o = envs ? `--env-vars "${envs}"` : ''
        const args_o = app.args ? `-- ${app.args}` : ''
        const interpreter_o = app.interpreter ? `--interpreter "${app.interpreter}"` : ''
        const CMD = `ser create ${app.script} --name ${app.name} ${interpreter_o} ${envs_o} --start --enable --auto-restart ${args_o}`
        const cwd = path.resolve(app.cwd)
        console.log(`Running command:\n\`\`\`\n${CMD}\n\`\`\`\nCWD: ${cwd}`)
        await exec(CMD, { cwd: cwd })
        successCount++
        bootResult.push({ app: app.name, status: 'success' })
      } catch (error) {
        bootResult.push({ app: app.name, status: 'failure' })
        console.error(`Failed to boot app "${app.name}"`)
        console.error(error)
      }
      console.log('-'.repeat(48))
    }

    console.log()
    if(successCount === apps.length){
      console.log('Successfully booted all apps!')
    }else{
      console.log(`Successfully booted ${successCount} apps, and ${apps.length - successCount} failed.`)
    }
    console.table(bootResult)
    console.log()
    const { stdout } = await exec('ser status')
    console.log(stdout)

  }else if(cmd === 'unboot'){

    for(let app of apps){
      try {
        console.log(`Unbooting "${app.name}"`)
        await exec(`ser stop ${app.name}`)
        await exec(`ser rm ${app.name}`)
      } catch (error) {
        
      }
    }

    console.log()
    console.log('Unbooted all apps.')
    console.log()
    const { stdout } = await exec('ser status')
    console.log(stdout)

  }else{
    throw new Error('Unknow command')
  }
}


run()
.then(() => process.exit(0))
.catch(err => {
    console.error(err)
    process.exit(1)
})