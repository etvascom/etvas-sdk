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
  apiURL: 'https://api.helloetvas.com',
  apiKey: '1234-1234-1234-1234',
  eventSecret: 'my-signature-secret',
}
etvas.init(config)
```

If you have multiple product variants, you can easily put them here:

```
const etvas = require('@etvas/etvas-sdk')

const config = {
  apiURL: 'https://api.helloetvas.com',
  apiKey: '1234-1234-1234-1234',
  eventSecret: 'my-signature-secret',
  productVariants: {
    'key-1234': 'white',
    'key-2345': 'green'
  }
}
etvas.init(config)
```

(see more on variants [in context](#variants-in-context) or [outside context](#variants-outside-context)

If you want to communicate with Etvas API (and you should :), you need to sign your requests. The signing secret is provided by Etvas and you should use it in the `init` function as follows:

```
const etvas = require('@etvas/etvas-sdk')

const config = {
  apiURL: 'https://api.helloetvas.com',
  apiKey: '1234-1234-1234-1234',
  eventSecret: 'my-signature-secret',
  reqSignatureSecret: 'super-secret-key'
}
etvas.init(config)
```

Of course, you might want to test the events with a quick method like curl or Postman. This means you will not be able to supply a signature header easily.

In order to accomplish this, you can pass a `debug` variable in your config like this:

```
const etvas = require('@etvas/etvas-sdk')

const config = {
  apiURL: 'https://api.helloetvas.com',
  apiKey: '1234-1234-1234-1234',
  eventSecret: 'my-signature-secret',
  reqSignatureSecret: 'super-secret-key',
  debug: {
    suppressSignatureCheck: true
  }
}
etvas.init(config)
```

When the system encounters the `suppressSignatureCheck` with a `true` value, it will not be checked, even if exists in the header.

The debug variables can find their way in a production environment. In order to avoid this, a special environment variable is required to be set to true for taking the `debug` section into account. This environment variable is named `ETVAS_SDK_DEBUG=true`. If the environment variable is not present or is set to false, the debug configuration is ignored.

Using Postman or curl requires you to send by POST the events to your local api. The Etvas Backend, for example, when sending a Purchase Succeeded event (without the signature check), the payload will look like this:

```
POST HTTP/1.1 http://localhost:5000/api/events
Content-Type: application/json
Accept: application/json

{
  "name": "purchase.succedded",
  "payload": {
     "productId": "1234-1234-1234-1234",
     "purchaseId": "1234-1234-1234-1235",
     "metadata": {
       "cancelsAt": 1633420771342,
        "trialEndsAt": 1633420771332,
        "isDemo": false
      }
    }
  },
  "timestamp": 1633420771994
}
```

--

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

> Note: the maximum length of the data you can write is 100k (after JSON stringify)

```

const data = { subscription: '1234', purchaseDate: (new Date()).valueOf() }
await etvas.client(token).write(data)

```

You can access previously saved data in the same context, even if the
token is changed. As long as we're talking about the same purchase, you
will always get the same date you saved.

```

const data = etvas.client(token).write(data)
assert.strictEqual(data.subscription, '1234')

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
assert.strictEqual(data.userId, '1234')

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

You will receive some events and you need to process some of them.
When the event is required to be processed, it means you need to
return a `HTTP/1.1 200 OK` response when Etvas calls you.

Here are the events emitted by Etvas Servers:

- `product.purchased` - when the payment has been accepted and before the user can use the product.
- `product.suspended` - when the subsequent subscription payment (i.e. next month debit) was declined by the customer's card, the product/service should not be usable anymore and the subscription suspended, but all the data should remain in place.
- `product.resumed` [ **NOTE**: currently `product.repurchased` but a refactor is on the way] - When the customer took action and the payment went through, the subscription must be re-instantiated without any data loss.
- `product.canceled` - the product was canceled by the user or the fixed-term subscription reached it's end. The subscription should be erased together with all the data. The user can re-purchase the product/service again (if available).
- `user.deleted` - The user asked to delete all it's data. All active and past subscriptions and the entire user information should be deleted (or anonymized).

> **NOTE**: When the customer deletes his account, we will cancel all active subscriptions linked to that customer. However, the order in which th events arrive is not guaranteed. For example, a `user.deleted` event can arrive before a `product.canceled` event regarding the same customer.

All the events share the same payload:

```

HTTP/1.1 POST /etvas/events
Content-Type: application/json
{
"name": "event.name",
"payload": {
"productId": "1234-uuid",
"purchaseId": "2345-uuid"
},
timestamp: 123123123
}

```

In addition, the `user.deleted` event will receive the deleted customer profile (one last time). By the time you receive the event, the customer profile is already deleted (or anonymized) so a call to `getProfile` or `/user/profile` will not yield the desired results anymore. Here is an example:

```

HTTP/1.1 POST /etvas/events
Content-Type: application/json
{
"name": "user.deleted",
"payload": {
"productId": "1234-uuid",
"purchaseId": "2345-uuid"
},
"profile": {
"firstName": "Customer first name",
"lastName": "Customer last name",
"email": "Customer email address",
"phoneNumber": "Customer phone number"
},
timestamp: 123123123
}

```

All events received by `POST` in your application are HMAC signed. The signature is present in the `x-etvas-signature` header of the request.

#### Verify the signature

You should **always** verify the signature against the request body.

As you know, a typical request body is a JSON:

```

{
"name": "event.name",
"payload": {
"productId": "1234",
"purchaseId: "2345"
},
timestamp: 123123123
}

```

For verifying a signature, you can use the following code:

```

const canonical = JSON.stringify(req.body)
const expected = req.get('x-etvas-signature')
assert.strictEqual(etvas.hmac.verify(canonical, expected))

```

In addition, you should also verify the `timestamp` value to be valid: the difference between the transmitted timestamp and local one should not be more than 60 seconds:

```

const { timestamp } = req.body
const now = Date.now()
const oneMinute = 60000
if (isNaN(timestamp) || typeof timestamp !== 'number' || timestamp <= 0 || Math.abs(now - timestamp) < oneMinute) {
throw new Error('Something is wrong with the timeline!')
}

```

> Note: Using etvas SDK for events will verify the signature automatically for you, and will report a 401 error of the signature does not verify. Also, if error occurs, your registered handler will not be called, so you don't have to worry about managing this kind of errors.

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

etvas.init({
apiURL: 'https://api.helloetvas.com",
apiKey: '12345678',
eventSecret: 'my-signature-secret'
})

const router = express.Router()
router.use('/event', etvas.events())

etvas.events.on('product.purchase', async data => {
// the signature and timestamps are already verified.
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

#### A word on product variants

If you configured product variants, you will automatically receive the variant name as second parameter in your handler:

```

const express = require('express')
const bodyParser = require('body-parser')
const assert = require('assert')

etvas.init({
apiURL: 'https://api.helloetvas.com",
apiKey: '12345678',
eventSecret: 'my-signature-secret'
productVariants: {
'key-1234': 'CHEAP_ONE',
'key-2345': 'AFFORDABLE_ONE'
}
})

const router = express.Router()
router.use('/event', etvas.events())

etvas.events.on('product.purchase', async (data, variant) => {
// assuming the user purchased the product with id "key-2345"
assert.strictEqual(data.purchaseId, 'AFFORDABLE_ONE')
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

```

```
