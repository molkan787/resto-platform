import { exec, replaceInTextFile, retryAsync, sleep, writeFile } from '../helpers.js'
import path from 'path'
import fs from 'fs/promises'
import { SOURCE_COLORS_FILENAME, TEMPLATE_ANDROID_MANIFEST_FILENAME, TEMPLATE_BACKEND_URL, TEMPLATE_BUILD_GRADLE_FILENAME, TEMPLATE_LINK_API_FILENAME, TEMPLATE_MAIN_ACTIVITY_FILENAME, TEMPLATE_MAIN_COLOR_LINE, TEMPLATE_PACKAGE_NAME, TEMPLATE_PREFIX } from './project-template.js'
import { mkdirp } from 'mkdirp'
import { rimraf } from 'rimraf'
import tempfile from 'tempfile'
import { log } from 'brolog'

const TAG = 'MobileClientBuilder'

const RES_DIR = 'android/app/src/main/res'
const ANDROID_SRC_MAIN_DIR = 'android/app/src/main'
const DART_SRC_MAIN_DIR = 'lib'
const BUILD_OUTPUT_FILENAME = 'build/app/outputs/flutter-apk/app-release.apk'

/**
 * @param {import('../types/interfaces.js').BuildPayload & { projectDir: string }} payload 
 * `primaryColor` should be provided in the following format "r,g,b"
 */
export async function build(payload){
    const { projectDir, packageName, appDisplayName, backendURL, iconFileData, primaryColor } = payload
    log.verbose(TAG, '[1/3] Preparing icon files...')
    await prepareIconFiles(projectDir, iconFileData)
    log.verbose(TAG, '[2/3] Preparing code files...')
    await prepareFiles({ projectDir, packageName, appDisplayName, backendURL, primaryColor })
    log.verbose(TAG, '[3/3] Compiling...')
    await retryAsync(() => exec('flutter build apk', { cwd: projectDir }), 3)
    const outputFilename = path.join(projectDir, BUILD_OUTPUT_FILENAME)
    return outputFilename
}

async function prepareIconFiles(projectDir, iconFileData){
    const s = tempfile({ extension: 'png' })
    await writeFile(s, iconFileData)
    const p = f => path.join(projectDir, RES_DIR, f, 'ic_launcher.png')
    await resizeImage(s, 48, p('mipmap-mdpi'))
    await resizeImage(s, 72, p('mipmap-hdpi'))
    await resizeImage(s, 96, p('mipmap-xhdpi'))
    await resizeImage(s, 144, p('mipmap-xxhdpi'))
    await resizeImage(s, 192, p('mipmap-xxxhdpi'))
    await rimraf(s)
}

function resizeImage(input, width, output){
    return exec(`magick "${input}" -resize ${width} "${output}"`)
}

/**
 * @param {{ projectDir: string, packageName: string, appDisplayName: string, backendURL: string, primaryColor: string }} options 
 */
export async function prepareFiles(options){
    const { projectDir, packageName, appDisplayName, backendURL, primaryColor } = options
    
    // TODO: {TODO-SECURITY} Sanitize/Check provided parameters before injecting them into code
    
    log.verbose(TAG, 'Setting PackageName and App Name in AndroidManifest.xml')
    const dstAndroidManifest = path.join(projectDir, ANDROID_SRC_MAIN_DIR, 'AndroidManifest.xml')
    await fs.copyFile(
        path.join(projectDir, ANDROID_SRC_MAIN_DIR, TEMPLATE_ANDROID_MANIFEST_FILENAME),
        dstAndroidManifest
    )
    await replaceInTextFile(dstAndroidManifest, TEMPLATE_PACKAGE_NAME, packageName, true)
    await replaceInTextFile(dstAndroidManifest, 'android:label="Murew"', `android:label="${appDisplayName}"`, true)

    log.verbose(TAG, 'Creating source\'s directories chain to match the package name')
    const packageNameDirs = packageName.split('.')
    const srcPackageNameDir = path.join(projectDir, ANDROID_SRC_MAIN_DIR, 'kotlin', ...packageNameDirs)
    await rimraf(path.join(projectDir, ANDROID_SRC_MAIN_DIR, 'kotlin'))
    await mkdirp(srcPackageNameDir)

    log.verbose(TAG, 'Settting the PackageName in MainActivity.kt')
    const dstMainActivity = path.join(srcPackageNameDir, 'MainActivity.kt')
    await fs.copyFile(
        path.join(projectDir, ANDROID_SRC_MAIN_DIR, TEMPLATE_MAIN_ACTIVITY_FILENAME),
        dstMainActivity
    )
    await replaceInTextFile(dstMainActivity, TEMPLATE_PACKAGE_NAME, packageName, true)

    log.verbose(TAG, 'Settting the PackageName in android/app/build.gradle')
    const dstBuildGradle = path.join(projectDir, 'android', 'app', 'build.gradle')
    await fs.copyFile(
        path.join(projectDir, 'android', 'app', TEMPLATE_BUILD_GRADLE_FILENAME),
        dstBuildGradle
    )
    await replaceInTextFile(dstBuildGradle, TEMPLATE_PACKAGE_NAME, packageName, true)

    log.verbose(TAG, 'Setting the Vendor\'s Backend-URL in the dart source code (backend/link_api.dart)')
    const dstLinkApi = path.join(projectDir, DART_SRC_MAIN_DIR, 'backend', 'link_api.dart')
    await fs.copyFile(
        path.join(projectDir, DART_SRC_MAIN_DIR, 'backend', TEMPLATE_LINK_API_FILENAME),
        dstLinkApi
    )
    await replaceInTextFile(dstLinkApi, TEMPLATE_BACKEND_URL, backendURL, true)

    log.verbose(TAG, 'Setting Primary Color in the dart source code (Themes/colors.dart)')
    const dstColors = path.join(projectDir, DART_SRC_MAIN_DIR, 'Themes', SOURCE_COLORS_FILENAME)
    await fs.copyFile(
        path.join(projectDir, DART_SRC_MAIN_DIR, 'Themes', TEMPLATE_PREFIX + SOURCE_COLORS_FILENAME),
        dstColors
    )
    await replaceInTextFile(dstColors, TEMPLATE_MAIN_COLOR_LINE, `mainColor = Color.fromARGB(255, ${primaryColor})`, true)

    log.verbose(TAG, 'prepareFiles() completed')
}


/**
 * @param {{ vendorId: string }} options 
 */
async function generateSigningStore(options){
    
}