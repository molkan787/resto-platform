import path from 'path'
import fs from 'fs/promises'
import { rimraf } from 'rimraf'

export const TEMPLATE_PREFIX = 'TEMPLATE_'
export const TEMPLATE_PACKAGE_NAME = 'com.murew.mobile.client'
export const TEMPLATE_BACKEND_URL = 'http://backend.manzil-tandoori.com'
export const TEMPLATE_MAIN_COLOR_LINE = 'mainColor = Color.fromARGB(255, 206, 33, 62)'
export const TEMPLATE_ANDROID_MANIFEST_FILENAME = 'TEMPLATE_AndroidManifest.xml'
export const TEMPLATE_MAIN_ACTIVITY_FILENAME = 'TEMPLATE_MainActivity.kt'
export const TEMPLATE_BUILD_GRADLE_FILENAME = 'TEMPLATE_build.gradle'
export const TEMPLATE_LINK_API_FILENAME = 'TEMPLATE_link_api.dart'

export const SOURCE_COLORS_FILENAME = 'colors.dart'

export async function prepareProjectTemplate(projectDir){
    const dartSrcMainDir = path.join(projectDir, 'lib')
    const androidSrcMainDir = path.join(projectDir, 'android/app/src/main')
    const androidAppDir = path.join(projectDir, 'android/app')
    await fs.copyFile(
        path.join(androidSrcMainDir, 'AndroidManifest.xml'),
        path.join(androidSrcMainDir, TEMPLATE_ANDROID_MANIFEST_FILENAME)
    )
    await fs.copyFile(
        path.join(androidSrcMainDir, 'kotlin/com/murew/mobile/client/MainActivity.kt'),
        path.join(androidSrcMainDir, TEMPLATE_MAIN_ACTIVITY_FILENAME)
    )
    await rimraf(path.join(androidSrcMainDir, 'kotlin'))
    await fs.copyFile(
        path.join(androidAppDir, 'build.gradle'),
        path.join(androidAppDir, TEMPLATE_BUILD_GRADLE_FILENAME)
    )
    await fs.copyFile(
        path.join(dartSrcMainDir, 'backend', 'link_api.dart'),
        path.join(dartSrcMainDir, 'backend', TEMPLATE_LINK_API_FILENAME)
    )
    await fs.copyFile(
        path.join(dartSrcMainDir, 'Themes', SOURCE_COLORS_FILENAME),
        path.join(dartSrcMainDir, 'Themes', TEMPLATE_PREFIX + SOURCE_COLORS_FILENAME)
    )
}
