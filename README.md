# etvas-sdk

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
const etvas = require('@etvas/etvs-sdk')

const config = {
  apiURL: 'https://api.etvas.com',
  apiKey: '1234-1234-1234-1234'
}
etvas.init(config)
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

## Events

You will receive some events and you need to process some of them.
When the event is required to be processed, it means you need to
return a `HTTP/1.1 200 OK` response when Etvas calls you.

Here are the events emitted by Etvas Servers:

- `purchase` - when the payment has been accepted and before the user can use the product. **Requires handling**

#### If you are using `express`, we got your back:

```
express.use(etvas.events())
```

This will automatically return a `HTTP/1.1 200 OK` response to all events, wether
you wish or not to handle them. If you do, here is how you should do it:

```
etvas.events.on('purchase', async data => {
  // manage data
  //...

  // return truthy value for a 200 OK response.
  // return falsy or throw an error to block the purchase flow.
  return true
})
```

#### If you are not using `express`

You need to have a slightly different approach. The example below
is still for `express` but yoy can adapt it for anything out there:

```
const { path, method } = etvas.events.handlers.purchase
// the method is one of get, post, put, patch or delete
router[method](path, (req, res, next) => {
  const { data } = req.body
  // manage data
  //...

  // return a 200 OK status
  res.status(200).send({ success: true })

  // or return a 4xx or 5xx error
  res.status(500).send({ error: 'Could not process this request' })
})
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
