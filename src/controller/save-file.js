/**
 * @description 保存上传的文件
 */

const os = require('os')
const fs = require('fs')
const path = require('path')
const formidable = require('formidable')
const { objForEach } = require('../util')
const { PROTOCOL, PORT, IP } = require('../../config')
const FILE_FOLDER = 'public/upload'
const isWindows = os.type().toLowerCase().indexOf('windows') >= 0
const TMP_FOLDER = 'public/upload-tmp'

/**
 * 生成随机字符串
 */
const generateRandomString = (length = 15) => {
    const charset = 'abcdefghijklmnopqrstuvwxyz'
    let randomString = ''

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length)
        randomString += charset[randomIndex]
    }

    return randomString
}

/**
 * 生成随机文件名
 * @param {string} fileName 文件名
 */
function genRandomFileName(fileName = '') {
    // 如 fileName === 'a.123.png'

    const r = generateRandomString()
    if (!fileName) return r

    const length = fileName.length // 9
    const pointLastIndexOf = fileName.lastIndexOf('.') // 5
    if (pointLastIndexOf < 0) return `${fileName}-${r}`

    const ext = fileName.slice(pointLastIndexOf + 1, length) // "png"
    return `${r}.${ext}`
}

/**
 * 保存上传的文件
 * @param {Object} req request
 * @param {number} time time 用于测试超时
 */
function saveFiles(req, time = 0) {
    return new Promise((resolve, reject) => {
        const imgLinks = []
        const form = formidable({ multiples: true })

        // windows 系统，处理 rename 报错
        if (isWindows) {
            const tmpPath = path.resolve(__dirname, '..', '..', TMP_FOLDER) // 在根目录下
            if (!fs.existsSync(tmpPath)) {
                fs.mkdirSync(tmpPath)
            }
            form.uploadDir = TMP_FOLDER
        }

        form.parse(req, function (err, fields, files) {
            if (err) {
                reject('formidable, form.parse err', err.stack)
            }
            // 存储图片的文件夹
            const storePath = path.resolve(__dirname, '..', '..', FILE_FOLDER)
            if (!fs.existsSync(storePath)) {
                fs.mkdirSync(storePath)
            }

            // 遍历所有上传来的图片
            objForEach(files, (name, file) => {
                // 图片临时位置
                const tempFilePath = file.path
                // 图片名称和路径
                const fileName = genRandomFileName(file.name || name) // 为文件名增加一个随机数，防止同名文件覆盖
                const fullFileName = path.join(storePath, fileName)

                // 将临时文件保存为正式文件
                fs.copyFileSync(tempFilePath, fullFileName)
                // 存储链接
                const url = `${PROTOCOL}://${IP}:${PORT}/${FILE_FOLDER}/${fileName}`
                imgLinks.push({
                    path: `/${FILE_FOLDER}/${fileName}`,
                    domain: `${PROTOCOL}://${IP}:${PORT}`,
                    url,
                    alt: fileName,
                    href: url
                })
            })

            // 返回结果
            let data
            if (imgLinks.length === 1) {
                data = imgLinks[0]
            } else {
                data = imgLinks
            }

            setTimeout(() => {
                resolve({
                    code: 200,
                    desc: '上传成功',
                    data: imgLinks,
                })
            }, time)
        })
    })
}

module.exports = saveFiles
