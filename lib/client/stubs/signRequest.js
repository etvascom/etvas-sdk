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

const extractQueryFromURL = url => {
  const [path, query] = url ? url.split('?') : ''
  return { path, query }
}

const computeSignature = (
  { method, path, query, context, canonical, contentType, timestamp },
  options
) => {
  const hash = computeHash(canonical)
  const { apiKey, reqSignatureSecret } = options
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
  return crypto
    .createHmac('sha256', reqSignatureSecret)
    .update(needsSign)
    .digest('hex')
}

const prepareSignature = (config, options, forcedTimestamp = null) => {
  const method = config.method || 'GET'
  let path = config.url || ''
  let query = config.params ? transformParams(config.params) : undefined
  if (!query) {
    const { path: stripedPath, query: stripedQuery } = extractQueryFromURL(
      config.url
    )
    if (stripedQuery) {
      query = stripedQuery
      path = stripedPath
    }
  }
  const context =
    config.headers && config.headers['x-etvas-context']
      ? config.headers['x-etvas-context']
      : ''
  const canonical = config.data
    ? typeof config.data === 'string'
      ? config.data
      : JSON.stringify(config.data)
    : undefined

  let contentType = ''
  if (config.headers) {
    const found = Object.keys(config.headers).find(
      name => name.toLowerCase().trim() === 'content-type'
    )
    if (found) {
      contentType = config.headers[found]
    }
  }

  const timestamp = forcedTimestamp || Math.floor(Date.now() / 1000)
  const signature = computeSignature(
    { method, path, query, context, canonical, contentType, timestamp },
    options
  )
  return { signature, timestamp, canonical }
}

module.exports = {
  computeHash,
  prepareSignature
}
