import { ethers } from 'hardhat';
import { createObjectCsvWriter } from 'csv-writer';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const Card = await ethers.getContractFactory("LXDAOBuidler");
    const card = await Card.attach("0xbd7ABBee471f7a0ffe5FCC4cE176D92Ca3F4dFfe");

    const filter = card.filters.Minted();
    const events = await card.queryFilter(filter);

    const records = events.map((event: any) => {
        return {
            tx: event.transactionHash,
            minter: event.args.minter,
            tokenId: event.args.tokenId.toString(),
            tokenUri: ""
        };
    });
    console.log("minter,tokenId,tokenUri");
    for (let i = 0; i < events.length; i++) {
        const tokenUri = await card.tokenURI(events[i].args.tokenId);
        console.log(`${events[i].args.minter},${events[i].args.tokenId.toString()},${tokenUri}`);
        // update event
        records[i].tokenUri = tokenUri;
    }

    // console.log(events);

    const csvWriter = createObjectCsvWriter({
        // path: `snapshot/${events[events.length - 1].blockNumber}.csv`,
        path: `snapshot/snapshot.csv`,
        header: [
            { id: 'tx', title: 'tx' },
            { id: 'minter', title: 'minter' },
            { id: 'tokenId', title: 'tokenId' },
            { id: 'tokenUri', title: 'tokenUri' }
        ]
    });

    await csvWriter.writeRecords(records);
    console.log('CSV file created successfully.');
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });