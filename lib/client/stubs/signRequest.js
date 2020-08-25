const crypto = require('crypto')

const computeHash = canonical => {
  return crypto
    .createHash('sha256')
    .update(canonical || '')
    .digest('hex')
}

const transformParams = params =>
  Object.keys(params)
    .reduce(
      (acc, name) => [
        ...acc,
        `${encodeURIComponent(name)}=${encodeURIComponent(params[name])}`
      ],
      []
    )
    .join('&')

const getSignature = (config, options) => {
  const method = config.method || 'GET'
  const path = config.url || ''
  const query = config.params ? transformParams(config.params) : undefined
  const context =
    config.headers && config.headers['x-etvas-context']
      ? config.headers['x-etvas-context']
      : ''
  const canonical = config.data
    ? typeof config.data === 'string'
      ? config.data
      : JSON.stringify(config.data)
    : undefined
  const contentType =
    config.headers && config.headers['content-type']
      ? config.headers['content-type']
      : ''
  const timestamp = Math.floor(Date.now() / 1000)
  const hash = computeHash(canonical)
  const apiKey = options.apiKey
  const reqAttributes = [
    method.toUpperCase(),
    path,
    ...(query ? [query] : []),
    ...(contentType ? ['content-type:' + contentType] : []),
    'x-api-key:' + apiKey,
    ...(context ? ['x-etvas-context:' + context] : []),
    'x-timestamp:' + timestamp,
    hash
  ]

  const eol = '\n'
  const needsSign = reqAttributes.join(eol)
  const secretKey = options.reqSignatureSecret
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(needsSign)
    .digest('hex')
  return { signature, timestamp, canonical }
}

const computeSignature = (
  method,
  path,
  query,
  context,
  canonical,
  contentType,
  timestamp
) => {
  const hash = computeHash(canonical)
  const apiKey = process.env.ETVAS_API_KEY

  const reqAttributes = [
    method.toUpperCase(),
    path,
    ...(query ? [query] : []),
    ...(contentType ? ['content-type:' + contentType] : []),
    'x-api-key:' + apiKey,
    ...(context ? ['x-etvas-context:' + context] : []),
    'x-timestamp:' + timestamp,
    hash
  ]

  const eol = '\n'
  const needsSign = reqAttributes.join(eol)
  const secretKey = process.env.ETVAS_SIGN_SECRET
  return crypto.createHmac('sha256', secretKey).update(needsSign).digest('hex')
}

module.exports = {
  computeHash,
  computeSignature,
  getSignature
}
