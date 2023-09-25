const router = require('koa-router')()
const saveFiles = require('./controller/save-file')

// 上传文件
router.post('/upload/file', async function (ctx, next) {
    const data = await saveFiles(ctx.req)
    ctx.body = data
})

module.exports = router
