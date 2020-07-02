# etvas-sdk

![Unit Testing](https://github.com/etvascom/etvas-sdk/workflows/unit-testing/badge.svg)
![Code coverage 85%](https://github.com/etvascom/etvas-sdk/workflows/Code%20coverage%2085%25/badge.svg)
![GitHub top language](https://img.shields.io/github/languages/top/etvascom/etvas-sdk)
![GitHub repo size](https://img.shields.io/github/repo-size/etvascom/etvas-sdk)
![npm](https://img.shields.io/npm/dt/@etvas/etvas-sdk)
![GitHub issues](https://img.shields.io/github/issues/etvascom/etvas-sdk)
![GitHub last commit](https://img.shields.io/github/last-commit/etvascom/etvas-sdk)

This package is to be used with all Etvas Apps backends and includes all the common resources related Server 2 Server communication with Etvas Servers.

### Installation

Use `npm` or `yarn` package manager to install the dependency.

```
$ npm install @etvas/etvas-sdk --save
// or
$ yarn add @etvas/etvas-sdk
```

### Configuration

First, you need to configure the library. Call the `init` function
as early as possible in your application, so you don't get a nasty
error when trying to call other Etvas functions.

```
const etvas = require('@etvas/etvas-sdk')

const config = {
  apiURL: 'https://api.etvas.com',
  apiKey: '1234-1234-1234-1234'
}
etvas.init(config)
```

If you have multiple product variants, you can easily put them here:

```
const etvas = require('@etvas/etvas-sdk')

const config = {
  apiURL: 'https://api.etvas.com',
  apiKey: '1234-1234-1234-1234',
  productVariants: {
    'key-1234': 'white',
    'key-2345': 'green'
  }
}
etvas.init(config)
```

(see more on variants [in context](#variants-in-context) or [outside context](#variants-outside-context)

See what version you are currently using with:

```
const etvas = require('@etvas/etvas-sdk')
console.log('I am using the awesome @etvas/etvas-sdk version', etvas.version)
```

### Using the client

The Etvas client is used to connect to Etvas API Servers. There are two
contexts in which you can use the client. The first one is when you have
a `token` - named the purchase context, and a second one, in which you
can make calls without any token. Behind the scenes, the client will
always use the API key configured to authenticate the call.

#### Making calls in the purchase context (with a token)

First thing you should do is to validate the token,
thus knowing for sure the token is legit.

```
const isTokenValid = await etvas.client(token).validate()
if (!isTokenValid) {
  console.error('Something is fishy, this token is not legit', token)
  throw new Error('Invalid token')
}
```

Getting the customer profile is also easy:

```
const profile = await etvas.client(token).getCustomerProfile()
console.info('Customer first name', profile.firstName)
console.info('Customer last name', profile.lastName)
console.info('Customer email address', profile.email)
console.info('Customer phone number', profile.phoneNumber)
```

You may want to write some information of your own regarding
this purchase. This information can include your own purchaseId,
details about subscription or maybe just the purchase date.

> Note: the maximum length of the data you can write is 100k
> (after JSON stringify)

```
const data = { subscription: '1234', purchaseDate: (new Date()).valueOf() }
await etvas.client(token).write(data)
```

You can access previously saved data in the same context, even if the
token is changed. As long as we're talking about the same purchase, you
will always get the same date you saved.

```
const data = etvas.client(token).write(data)
assert.equals(data.subscription, '1234')
```

> Note: this information is attached to the purchase, not the customer.
> The customer might have multiple subscriptions on the same product
> or service.

If you need to delete the stored data:

```
await etvas.client(token).clear()
// or
await etvas.client(token).write(null)
```

You can send a welcoming email, like this:

```
const data = {
  locale: 'en',
  subject: 'Welcome',
  message: '<h1>Welcome</h1><p>You are most welcome in our application!</p>'
}
await etvas.client(token).sendEmailNotification(dat)
```

The subject must be a plain string (required). The message must be a
non-empty string and you can use HTML (see section about [HTML messages](#email-messages)).

#### Variants in context

A variant is, for example, a color on your product which dictates how the calls are made to your API or how the UI is rendered. If you configured the variants in your initialization process, you can use a token or a `productId` to easily identify the name (or whatever value you put on the configuration) of the variant.

For example:

```
etvas.init({
  ...options,
  productVariants: {
    'key-1234': 'white',
    'key-2345': 'green'
  }
})

// when you receive the token:
const token = '...'
const variant = await etvas.client(token).getProductVariant()

// the variant will have a value of white or green, depending on the information contained in token
```

Please note the `async` function here, because it might verify the token with an Axios call (if not already cached). In most cases though, the call will resolve immediately, as the token verification result is already cached.

#### Making calls outside the purchase context

There are times when the customer is not present (you do not have a token)
and you need to get or put information on Etvas servers. These calls are
outside purchase context. Writing data is a breeze, as is basically a
key:value type database:

> Note: the maximum length of the data you can write is 100k
> (after JSON stringify)

```
const data = { userId: '1234' }
await etvas.client.write('my-key', data)
```

Need to read the data back? No problem (as long as you know the key in which
you saved the data):

```
const data = await etvas.client.read('my-key')
assert.equals(data.userId, '1234')
```

If you decide to erase the stored information, you can use:

```
await etvas.client.clear('my-key')
// or
await etvas.client.write('my-key', null)
```

Sending an email message is easy, as long as you know a `contextId`
(meaning a purchaseId):

```
const data = {
  locale: 'en',
  subject: 'Hello',
  message: 'We are pleased to inform you everything is ok.',
}
await etvas.client.sendEmailNotification(contextId, data)
```

All fields in data are required and they must be strings. The
`contextId` must be a valid context, stored on your side when
a purchase is made and you validate the token.

#### Variants outside context

A variant is, for example, a color on your product which dictates how the calls are made to your API or how the UI is rendered. If you configured the variants in your initialization process, you can use a `productId` to easily identify the name (or whatever value you put on the configuration) of the variant.

For example:

```
etvas.init({
  ...options,
  productVariants: {
    'key-1234': 'white',
    'key-2345': 'green'
  }
})

// when you have the productId (as result, for example, of an event)
etvas.events.on('product.canceled', async data => {
  const variant = etvas.client.getProductVariant(data.productId)
  // the variant will have a value of white or green.
})

```

Please note the `sync` character of `getProductVariant` function, which differs from the [one on context](#variants-in-context).

#### Email messages

You can use HTML and a set of classes in your message. For example:

```
const message = `
<h1 class="title">Hello,</h1>
<p class="text">
  We are pleased to inform you that your date is safely stored
  in the most secure servers on the planet!
</p>
<hr class="separator" />
<div style="text-align: center;">
  <a class="button_accent" href="#product_use_url">Access your data</a>
</div>
`

const data = {
  locale: 'en',
  subject: 'Hello #user_first_name',
  message
}
```

Your message will be inline-styled (for maximum compatibility with the email
clients out there), based on the following classes:

- `title` - a center-aligned title
- `text` - normal paragraph text
- `card_grey` - a greyish card with rounded corners and padding
- `card-text_grey` - a text easily visible inside the card_grey
- `card-text_black` - a bolded text visible inside the card_grey
- `button_accent` - an accent button (used for Call To Action)
- `link` - a link styled with the accent color and underline
- `separator` - a 40px height div used to separate sections

Please note the use of variables inside your `message` and `subject`. They will be automatically replaced just before sending the message. All the variables are prefixed with a `#`, and the complete list is:

- `#user_first_name` - the user's first name
- `#user_last_name` - the user's last name
- `#product_name` - the product name
- `#portal_url` - the URL for the portal from which the product was purchased
- `#product_use_url` - the direct link URL for launching the product

## Events

> Note: Work in progress

You will receive some events and you need to process some of them.
When the event is required to be processed, it means you need to
return a `HTTP/1.1 200 OK` response when Etvas calls you.

Here are the events emitted by Etvas Servers:

- `product.purchased` - when the payment has been accepted and before the user can use the product.

#### If you are using `express`, we got your back:

```
const express = require('express')
const bodyParser = require('body-parser')

const router = express.Router()
router.use(etvas.events())
```

This will automatically return a `HTTP/1.1 501 Not Implemented` response to all events, wether you wish or not to handle them. If you do, here is how you should do it:

```
const express = require('express')
const bodyParser = require('body-parser')
const assert = require('assert')

const router = express.Router()
router.use('/event', etvas.events())

etvas.events.on('product.purchase', async data => {
  // manage data
  assert.strictEqual(typeof data.purchaseId, 'string')
  assert.strictEqual(typeof data.productId, 'string)

  // return truthy value for a 200 OK response.
  // return falsy or throw an error to block the purchase flow.
  return true
})

const app = express()
app.use('/api', router)
```

#### If you are not using `express`

You need to have a slightly different approach. The example below
uses `http` NodeJS implementation.

```
const http = require('http')
const assert = require('assert')

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST' || req.url !== '/events') {
    res.statusCode = 405
    res.end('{"error":"METHOD_NOT_ALLOWED"}')
    return
  }

  let body = ''

  req.on('data', (data) => {
    body += data
  });

  req.on('end', () => {
    let parsed

    try {
      parsed = JSON.parse(body);
    } catch (e) {
      res.statusCode = 400
      res.end('{"error":"JSON only!"}')
      return
    }

    switch (parsed.name) {
      case 'product.purchased':
        assert.strictEqual(typeof parsed.payload.purchaseId, 'string')
        assert.strictEqual(typeof parsed.payload.productId, 'string)
        res.statusCode = 204
        res.end()
      default:
        // unhandled event:
        res.statusCode = 501
        res.end()
    }
  })
})

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
```

#### Event aliases

If you have one handler for multiple events, you can use aliases or array of event names like this:

Use an array for registering multiple events on one handler:

```
//

etvas.events.on(['product.suspended', 'product.canceled'], async data => {
  // manage data
  assert.strictEqual(typeof data.purchaseId, 'string')
  assert.strictEqual(typeof data.productId, 'string)

  // return truthy value for a 200 OK response.
  // return falsy or throw an error to block the purchase flow.
  return true
})
```

Or you can use alias function:

```
// First, register an event
etvas.events.on('product.suspended'], async data => {
  // manage data
  assert.strictEqual(typeof data.purchaseId, 'string')
  assert.strictEqual(typeof data.productId, 'string)

  // return truthy value for a 200 OK response.
  // return falsy or throw an error to block the purchase flow.
  return true
})

// And add aliases to it:
etvas.events.alias('product.suspended', 'product.canceled')

// or even with an array:
etvas.events.alias('product.suspended', ['product.canceled', 'user.deleted'])
```

> **WARNING**: When you unregister an event name, the other aliases you might already setup are not automatically unregistered. But, when using `off`, you can also use an array, not just an event name.

#### Unregister event handlers

This is pretty much a one-liner, and - you, guessed - must use the `off` function:

```
etvas.events.off('product.canceled')
```

Of course, you can use arrays, as well:

```
etvas.events.off([
  'product.canceled',
  'product.suspended',
  'product.purchased'
])
```

## Running tests and coverage

We are using [mocha](https://mochajs.org) and standard NodeJS `assert` library.
To run all tests, execute:

```

git clone https://github.com/etvascom/etvas-sdk.git
cd etvas-sdk
npm ci && npm run test

```

For code coverage, we use [istanbul](https://istanbul.js.org/). For
a code coverage report, run:

```

npm run cov

```

## Semver

Until `@etvas/etvas-sdk` reaches a `1.0` release, breaking changes
can be released with a new minor version. For example `0.3.5` and
`0.3.6` will have the same API, but `0.4.0` can have breaking changes.
Check back on this page to read the ChangeLog

## TODO

## Resources

- [Homepage](README.md)
- [Changelog](CHANGELOG.md)
- [Issues](https://github.com/etvascom/etvas-sdk/issues)

```

```
