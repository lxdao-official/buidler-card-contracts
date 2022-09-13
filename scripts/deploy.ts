import { ethers } from "hardhat";

async function main() {
  const LXDAOBuidlerMetadata = await ethers.getContractFactory(
    "LXDAOBuidlerMetadata",
  );
  const metadata = await LXDAOBuidlerMetadata.deploy(`${process.env.SIGNER}`);

  console.log("LXDAOBuidlerMetadata Deployed to:", metadata.address);

  const LXDAOBuidler = await ethers.getContractFactory("LXDAOBuidler");
  const buidler = await LXDAOBuidler.deploy(
    `${process.env.SIGNER}`,
    metadata.address,
  );

  console.log("LXDAOBuidler Deployed to:", buidler.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
