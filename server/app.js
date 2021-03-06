import Koa from 'koa'
import axios from 'axios'
import KoaStatic from 'koa-static'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'
import cors from '@koa/cors'
import globalConfig from './config'
import route from './routes'
import { getRssBodyFromBody } from './rss'

const app = new Koa()
const router = new Router()

let rss = ''
let baseUrl = `http://${globalConfig.app.host}:${globalConfig.app.apiPort}`
if (process.env.NODE_ENV === 'production') {
  baseUrl = globalConfig.production.domain
}

let rssApi = `${baseUrl}/${globalConfig.app.routerBaseApi}/articles`
axios.get(rssApi).then((ret) => {
  const {data} = ret
  rss = getRssBodyFromBody(data, {
    title: 'nayix',
    siteUrl: baseUrl,
    description: 'A blog'
  })
})

router.get('/rss.xml', (ctx, next) => {
  ctx.type = 'application/xml'
  return ctx.res.end(rss)
})

app.use(cors())
app.use(bodyParser())
app.use(KoaStatic('.'))
router.use('', route.routes())
app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(globalConfig.app.apiPort, '0.0.0.0')
console.log('Server listening on ' + '0.0.0.0:' + globalConfig.app.apiPort) // eslint-disable-line no-console
