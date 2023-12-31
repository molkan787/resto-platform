import { exec as native_exec, spawn } from 'child_process';
import native_path from 'path';
import fs from 'fs';
import { log } from 'brolog'
// const ncp = require('ncp').ncp;
// const kill = require('tree-kill');


export const sleep = time => new Promise(r => setTimeout(r, time));

/**
 * 
 * @param {string} cmd 
 * @param {({ encoding: "buffer" | null; } & import('child_process').ExecOptions)?} options 
 */
export const exec = function (cmd, options) {
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

export async function retryAsync(run, maxAttemps){
    for(let i = 0; i < maxAttemps; i++){
        try {
            await run()
        } catch (error) {
            log.silly('retryAsync', `Attemp #${i + 1} failed`)
            log.silly('retryAsync', error.toString())
            if(i >= maxAttemps - 1){
                throw error
            }
        }
    }
}

export const path = function (){
    return native_path.join(__dirname, ...arguments);
}
export const cp = (src, dest) => new Promise((resolve, reject) => {
    ncp(src, dest, err => err ? reject(err) : resolve());
});

/**
 * 
 * @param {fs.PathLike} filename 
 * @param {BufferEncoding} encoding 
 * @returns 
 */
export const readFile = (filename, encoding) => new Promise((resolve, reject) => {
    fs.readFile(filename, encoding || null, function(err, data) {
        if (err) reject(err);
        else resolve(data);
    });
})

/**
 * 
 * @param {fs.PathLike} filename 
 * @param {string | Buffer} data 
 * @param {BufferEncoding} encoding 
 * @returns 
 */
export const writeFile = (filename, data, encoding) => new Promise((resolve, reject) => {
    fs.writeFile(filename, data, encoding || null, err => {
        if(err) reject(err);
        else resolve(true);
    })
})

export const replaceInTextFile = async (filename, search, replacement) => {
    let data = await readFile(filename, 'utf8');
    data = data.replace(search, replacement);
    await writeFile(filename, data, 'utf8');
}

export const spawnLiveOutput = ({cwd, cmd, args, printTitle, skipStdErr}, onData, onExit) => {
    const proc = spawn(cmd, args, { cwd });
    proc.stdout.on('data', function (data) {
        if(typeof onData == 'function') onData(data.toString()); 
        fancyPrint(printTitle, data.toString());
    });
    
    if(!skipStdErr){
        proc.stderr.on('data', function (data) {
            fancyPrint(printTitle + '[ERROR]', data.toString());
        });
    }
    
    if(onExit) proc.on('exit', onExit);

    return {
        kill: () => kill(proc.pid),
    }
}

function fancyPrint(title, content){
    const header = '-'.repeat(15) + title + '-'.repeat(15);
    const footer = '-'.repeat(header.length);
    console.log('');
    console.log(header);
    console.log(content);
    console.log(footer);
    console.log('');
}

/**
 * @param {import('stream').Readable} sourceStream 
 * @param {import('stream').Writable} destinationStream 
 * @returns {Promise<any>}
 */
export function asyncPipe(sourceStream, destinationStream){
    return new Promise((resolve, reject) => {
        destinationStream.on('finish', resolve)
        destinationStream.on('error', reject)
        sourceStream.pipe(destinationStream)
    })
}



export async function routeHandler(req, res, handler){
    try {
        const value = await handler(req, res)
        if(typeof value === 'object' && value !== null){
            res.status(200)
            res.header('Content-Type', 'application/json')
            res.send(JSON.stringify(value))
        }else if(typeof value !== 'undefined'){
            res.status(200)
            res.header('Content-Type', 'text/plain')
            res.send(value.toString())
        }
    } catch (error) {
        log.error(error)
        res.status(500)
        res.send('{ "status": "error" }')
    }
}