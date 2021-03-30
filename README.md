# Fraxine

> ✨ Bootstrapped with Create Snowpack App (CSA).

This is a small playground for some Web API's as well as WebComponents I've been doing .NET for a while and I wanted to see if there are some things we can take from them and bring them over to javascriptland

I'm interested in the specific case of Particular WebComponents that implement an interface and can be swapped over for different purposes, my naive thinking goes so far about modularization and code sharing with these, for example what if you have some sort of web based e-commerce/POS system that you may need to change either aesthetics or particular functionality depending on the business client's needs while there will certainly be particular rules for each business perhaps you can standarize or get together core functionality for your components at the Element level (eg, a tag) and deviate from that once you need.

The basic gist in this repository is:

- Host implements `IHost` which implements what could be core event/responses for each children.

  It extends different Listener interfaces (eg. `ICartListener`, `ICatalogueListener`) where those can either be subscribing to a DOM node reference or using your library to listen for those events (eg. `addEventListener` vs `@on-event="..."`) the host then enables/disables whatever it needs accounting for elements that might be present or missing check `src/tun-pos-host.ts` this needs a little bit more of work or thinking on my part but the idea is there

- The children elements need to implement the interface they're going twork with.

  for example any shopping cart element can describe it's own UI freely but it should have the desired behavior present, check `src/components/tun-shopping-cart.ts` or `src/components/tun-catalogue.ts`

- The Host Element allows content projection via slots.

  This allows the consumer of the host to swap to their own implementation of a particular interface

### Extras

While playing with that hint to an architecture for a web system I also played a bit with some Web API's like

- [PaymentRequest API](https://developers.google.com/web/fundamentals/payments/merchant-guide/deep-dive-into-payment-request)

  which you can find at `src/components/tun-payments.ts`

- [WebComponents with LitElement](https://lit-element.polymer-project.org/)

  which I have to say it is incredibly nice to work with, almost as nice as [Aurelia](https://aurelia.io/) both have the same feel and both are built to be web standards compilant which is a win-win on both sides

- [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)

  which is a fairly recent addition to the web, it simplifies working with dates/currency formats pretty well

Lastly this is not a Web API but is built on top of it

- [PouchDB](https://pouchdb.com/)

  As a Local Database for 100% offline work as well as remote synchronization with a [CouchDB](https://couchdb.apache.org/) database, it works incredibly well tbh check both `src/components/tun-catalogue.ts` and `src/components/tun-sale-history.ts` to see both one-way and two-way synchronization between them

## Available Scripts

### pnpm start

Runs the app in the development mode.
Open http://localhost:8080 to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### pnpm run build

Builds the app for production to the `dist/` folder.
It correctly bundles the app in production mode and optimizes the build for the best performance.

## Directives

In case you need to add a directive like `classMap` you should add the extension to the import:

```
import { classMap } from "lit-html/directives/class-map.js";
```
