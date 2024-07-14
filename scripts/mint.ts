import bs58 from "bs58";
import { ethers } from "hardhat";
import * as dotenv from 'dotenv';
dotenv.config();

// let provider = new ethers.providers.JsonRpcProvider(process.env.API_URL)
let originalSigner = new ethers.Wallet(process.env.PRIVATE_KEY as string);//get Signer object

const ipfsURI = "ipfs://QmQcAazvzz8RDN9q2Shgn7on3vgcXCQMRmpnLNaBWvvFpJ";
const builderAddress = "0xCC968F87F7b7Cd5e3493cF87A7A6D2CaCC4E3d50"
const buidlerCardContract = "0x67b2D18D22bC06D3482c32b2Eedd29FF59FbCB1d"


async function getSignature(ipfs: string) {
    const ipfsHash = ipfs.replace('ipfs://', '');
    const bytes = bs58.decode(ipfsHash).slice(2);

    const hash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(["bytes", "address"], [bytes, builderAddress]),
    );
    const hashBytes = ethers.utils.arrayify(hash);
    console.log(originalSigner.address)
    const signature = await originalSigner.signMessage(hashBytes);
    console.log("Signature:", signature)
    return signature
}

export function ipfsToBytes(ipfsURI: string) {
    const ipfsHash = ipfsURI.replace('ipfs://', '');
    return bs58.decode(ipfsHash).slice(2);
}


// Don't forget to call set controller on the metadata contract
// Only contract caller can mint to self

async function main() {
    const LXDAOBuidler = await ethers.getContractFactory("LXDAOBuidler");
    const contract = LXDAOBuidler.attach(buidlerCardContract);
    const sig = await getSignature(ipfsURI)
    console.log("signer:", await contract.signer.getAddress())
    const tx = await contract.mint(ipfsToBytes(ipfsURI), sig);
    console.log("Transaction hash:", tx.hash);

    // 等待交易被确认
    await tx.wait();
    console.log("Minting completed");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
