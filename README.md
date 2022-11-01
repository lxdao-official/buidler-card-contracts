# LXDAO SBT-based Membership System Contract

This is the LXDAO SBT-based Membership System Contract project.

By using this contract, any Dao can issue a unique soul-bound token to community members.

## Step 1, fill the .env variable

`.env.example` explanation

- `API_URL` is the url of the archive node used to connect, we recommend using [Alchemy](https://www.alchemy.com/)/[infura](https://infura.io/).
- `PRIVATE_KEY` is the wallet private key, used for generating signature and pass to contract to verify. It is recommended to create a new empty wallet.
- `ETHERSCAN_API_KEY` is the api key create from `etherscan` used to access `ethereum` data.
- `SIGNER` is the public address of the wallet used to verify `mint` and `updateMetadata` call.

after all , modify the `.env.example` file to `.env`

## Step 2,Run unit tests

```
npm install
npm run test
```

## Step 3,Deploy

```
npm run compile
npm run deploy:goerli
```

When your deployment is complete, the `SIGNER` in the .env file will be the first `SIGNER` of the contract (which you can change later by using `setSigner`)

## Step 4,Mint
When a new member was added to the community, the signature of `SIGNER` is required, and the signature implementation function is as follows

```
iimport bs58 from "bs58";
import ethers from "ethers";
import * as dotenv from 'dotenv';
dotenv.config();

let provider = new ethers.providers.JsonRpcProvider(process.env.API_URL)
let originalSigner = new ethers.Wallet(process.env.PRIVATE_KEY, provider);//get Signer object

const ipfsHash = "Your ipfs Hash";
const builderAddress = "your wallet address"


async function getSignature() {
    const bytes = bs58.decode(ipfsHash).slice(2);

    const hash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(["bytes", "address"], [bytes, builderAddress]),
    );
    const hashBytes = ethers.utils.arrayify(hash);

    const signature = await originalSigner.signMessage(hashBytes);
    console.log("Signature:",signature)
    return signature
}

getSignature()
    
```


## Member Status intro

1. The `Pending` is the original status of the buidler which can't do everything before `mint` success.
2. The `Active` status means that the buidler finished onboarding process and call `mint` success.
3. Buidler can update metadata on official website themselves in `Active` status anytime.
4. If the buidler quit from community, the status should be set to `Archived`.
5. The buidler's status can be set to `Suspended` by committee for security reasons, reactivate is possible after resolve it.

## What is LXDAO?

LXDAO is an R&D-focused DAO in Web3. Our mission is: To bring together buidlers to buidl and maintain valuable projects for Web3, in a sustainable manner.

<a target="_blank" href="https://lxdao.io/"><img alt="Buidl in LXDAO" src="buildinlxdao.png" width="180" /></a>
