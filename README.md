# LXDAO SBT-based Membership System Contract

This is the LXDAO SBT-based Membership System Contract project.

## Run unit tests

```
npm install
npm run test
```

## Deploy

```
npm run compile
npm run deploy:rinkeby
```

## `.env` explanation

- `API_URL` is the url of the archive node used to connect, we recommend using Alchemy.
- `PRIVATE_KEY` is the wallet private key, used for generating signature and pass to contract to verify. It is recommended to create a new empty wallet.
- `ETHERSCAN_API_KEY` is the api key create from `etherscan` used to access `ethereum` data.
- `SIGNER` is the public address of the wallet used to verify `mint` and `updateMetadata` call.

## Contract guidance

1. The contract deployed must include `SIGNER` which can changed in the future.
2. The `Pending` is the original status of the buidler which can't do everything before `mint` success.
3. The `Active` status means that the buidler finished onboarding process and call `mint` success.
4. Buidler can update metadata on official website themselves in `Active` status anytime.
5. If the buidler quit from community, the status should be set to `Archived`.
6. The buidler's status can be set to `Suspended` by committee for security reasons, reactivate is possible after resolve it.

## What is LXDAO?

LXDAO is an R&D-focused DAO in Web3. Our mission is: To bring together buidlers to buidl and maintain valuable projects for Web3, in a sustainable manner.

<a target="_blank" href="https://lxdao.io/"><img alt="Buidl in LXDAO" src="buildinlxdao.png" width="180" /></a>
