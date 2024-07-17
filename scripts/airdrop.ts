require('dotenv').config();
const fs = require('fs');
const { ethers } = require('hardhat');
const { parse } = require('csv-parse');
const bs58 = require('bs58');


// Don't forget grant admin role to the deployer address

export function ipfsToBytes(ipfsURI: string) {
    const ipfsHash = ipfsURI.replace('ipfs://', '');
    return bs58.decode(ipfsHash).slice(2);
}


const { BUIDLER_CONTRACT_ADDRESS, METADATA_CONTRACT_ADDRESS } = process.env;
async function airdrop() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer Address is:", deployer.address);

    const Buidler = await ethers.getContractFactory("LXDAOBuidler");
    const buidler = await Buidler.attach(BUIDLER_CONTRACT_ADDRESS);

    const MetaData = await ethers.getContractFactory("LXDAOBuidlerMetadata");
    const metaData = await MetaData.attach(METADATA_CONTRACT_ADDRESS);

    // set signer
    const controller_tx = await metaData.updateController(BUIDLER_CONTRACT_ADDRESS);
    await controller_tx.wait();
    console.log("Controller set to:", BUIDLER_CONTRACT_ADDRESS);
    // set controller


    const file_path = `snapshot/snapshot.csv`
    const parser = fs
        .createReadStream(file_path)
        .pipe(parse({
            // CSV options if any
            columns: true
        }));
    const records = await parser.toArray();

    await buidler.airdrop(
        records.map((record: { minter: any; }) => record.minter),
        records.map((record: { tokenUri: any; }) => ipfsToBytes(record.tokenUri))
    )

}

airdrop()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });