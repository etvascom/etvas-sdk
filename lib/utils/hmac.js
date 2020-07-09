const crypto = require('crypto')

const sign = (
  canonical,
  key,
  options = {
    algorithm: 'sha256',
    encoding: 'hex'
  }
) => {
  if (
    canonical === undefined ||
    canonical === null ||
    typeof canonical !== 'string'
  ) {
    throw new Error('Trying to sign an invalid canonical')
  }

  if (!key) {
    throw new Error('Invalid hmac key')
  }

  const { encoding, algorithm } = options

  return crypto.createHmac(algorithm, key).update(canonical).digest(encoding)
}

const verify = (
  canonical,
  signature,
  key,
  options = { algorithm: 'sha256', encoding: 'hex' }
) => {
  if (!canonical) {
    throw new Error('Trying to sign an invalid canonical')
  }
  const obtained = sign(canonical, key, options)
  return signature instanceof Buffer
    ? signature.equals(obtained)
    : signature === obtained
}

module.exports = {
  sign,
  verify
}
