import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import bs58 from "bs58";

describe("LXDAOBuidler Test", function () {
  const ipfsHash = "QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz";
  const fileIPFSURI = `ipfs://${ipfsHash}`;

  async function deployLXDAOBuidlerFixture() {
    const Library = await ethers.getContractFactory("Base58");
    const library = await Library.deploy();
    await library.deployed();

    const [
      owner,
      originalSigner,
      changedSigner,
      buidler,
      otherBuidler,
      mockResource,
      buidler1,
      buidler2,
      buidler3,
    ] = await ethers.getSigners();

    const resourceFactory = await ethers.getContractFactory(
      "LXDAOBuidlerMetadata",
    );
    const factory = await ethers.getContractFactory("LXDAOBuidler");

    const LXDAOBuidlerMetadata = await resourceFactory.deploy(
      originalSigner.address,
    );

    const LXDAOBuidler = await factory.deploy(
      originalSigner.address,
      LXDAOBuidlerMetadata.address,
    );

    await LXDAOBuidlerMetadata.updateController(LXDAOBuidler.address);

    return {
      LXDAOBuidler,
      LXDAOBuidlerMetadata,
      owner,
      originalSigner,
      changedSigner,
      buidler,
      otherBuidler,
      resource: LXDAOBuidlerMetadata.address,
      mockResource,
      buidler1,
      buidler2,
      buidler3,
    };
  }

  it("Should set the right owner", async function () {
    const { LXDAOBuidler, owner } = await loadFixture(
      deployLXDAOBuidlerFixture,
    );
    expect(await LXDAOBuidler.owner()).to.equal(owner.address);
  });

  it("mint test #1 - Change buidler signer ", async function () {
    const { LXDAOBuidler, changedSigner } = await loadFixture(
      deployLXDAOBuidlerFixture,
    );

    await LXDAOBuidler.setSigner(changedSigner.address);
    expect(await LXDAOBuidler.getSigner()).to.be.equal(changedSigner.address);
  });

  it("mint test #2 - Change resource ", async function () {
    const { LXDAOBuidler, mockResource } = await loadFixture(
      deployLXDAOBuidlerFixture,
    );

    await LXDAOBuidler.setMetadataAddress(mockResource.address);
    expect(await LXDAOBuidler.getMetadataAddress()).to.be.equal(
      mockResource.address,
    );
  });

  async function getSignature(
    signer: { signMessage: (arg0: Uint8Array) => any },
    message: any[],
    messageTypes: string[],
  ) {
    const hash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode([...messageTypes], [...message]),
    );
    const hashBytes = ethers.utils.arrayify(hash);
    return signer.signMessage(hashBytes);
  }

  async function buidlerMint() {
    const { LXDAOBuidler, buidler, originalSigner } = await loadFixture(
      deployLXDAOBuidlerFixture,
    );

    const bytes = bs58.decode(ipfsHash).slice(2);
    const signature = await getSignature(
      originalSigner,
      [bytes, buidler.address],
      ["bytes", "address"],
    );

    return LXDAOBuidler.connect(buidler).mint(bytes, signature);
  }

  async function mintByBuidler(LXDAOBuidler: any, signer: any, buidler: any) {
    const bytes = bs58.decode(ipfsHash).slice(2);
    const signature = await getSignature(
      signer,
      [bytes, buidler.address],
      ["bytes", "address"],
    );

    return LXDAOBuidler.connect(buidler).mint(bytes, signature);
  }

  it("mint test #3 - cannot mint due to verify", async function () {
    const { LXDAOBuidler, changedSigner, originalSigner, buidler } =
      await loadFixture(deployLXDAOBuidlerFixture);

    const bytes = bs58.decode(ipfsHash).slice(2);
    const signature = await getSignature(
      changedSigner,
      [bytes, buidler.address],
      ["bytes", "address"],
    );

    await expect(
      LXDAOBuidler.connect(buidler).mint(bytes, signature),
    ).to.be.revertedWith(
      "VM Exception while processing transaction: reverted with reason string 'LXDAOBuidler: Invalid signature.'",
    );
  });

  it("mint test #4 - only mint once", async function () {
    const { LXDAOBuidler, buidler, originalSigner } = await loadFixture(
      deployLXDAOBuidlerFixture,
    );

    await buidlerMint();

    const bytes = bs58.decode(ipfsHash).slice(2);
    const signature = await getSignature(
      originalSigner,
      [bytes, buidler.address],
      ["bytes", "address"],
    );

    await expect(
      LXDAOBuidler.connect(buidler).mint(bytes, signature),
    ).to.be.revertedWith(
      "VM Exception while processing transaction: reverted with reason string 'LXDAOBuidler: The buidler has already minted.'",
    );
  });

  it("mint test #5 - update failed due to verify", async function () {
    const { LXDAOBuidler, buidler, changedSigner, originalSigner } =
      await loadFixture(deployLXDAOBuidlerFixture);

    await buidlerMint();

    const bytes = bs58.decode(ipfsHash).slice(2);
    // const bytesString = `0x${Buffer.from(bytes).toString("hex")}`;

    // error signer
    const signature = await getSignature(
      changedSigner,
      [bytes, buidler.address],
      ["bytes", "address"],
    );
    const tokenId = await LXDAOBuidler.tokenIdOfOwner(buidler.address);

    await expect(
      LXDAOBuidler.connect(buidler).updateMetadata(tokenId, bytes, signature),
    ).to.be.revertedWith(
      "VM Exception while processing transaction: reverted with reason string 'LXDAOBuidler: Invalid signature.'",
    );
  });

  it("mint test #6 - batch update failed due to status", async function () {
    const {
      LXDAOBuidler,
      LXDAOBuidlerMetadata,
      originalSigner,
      changedSigner,
      buidler1,
      buidler2,
      buidler3,
    } = await loadFixture(deployLXDAOBuidlerFixture);

    await mintByBuidler(LXDAOBuidler, originalSigner, buidler1);
    await mintByBuidler(LXDAOBuidler, originalSigner, buidler2);
    await mintByBuidler(LXDAOBuidler, originalSigner, buidler3);

    const tokenId1 = await LXDAOBuidler.tokenIdOfOwner(buidler1.address);
    const tokenId2 = await LXDAOBuidler.tokenIdOfOwner(buidler2.address);
    const tokenId3 = await LXDAOBuidler.tokenIdOfOwner(buidler3.address);

    const tokenIds = [tokenId1, tokenId2, tokenId3];
    const owners = [buidler1.address, buidler2.address, buidler3.address];
    const ipfsHashes = [
      "QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vx",
      "QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vy",
      "QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz",
    ];
    const valueList = [];
    const typeList1 = [];
    const typeList2 = [];
    for (let i = 0; i < owners.length; i++) {
      const bytes = bs58.decode(ipfsHashes[i]).slice(2);
      valueList.push(bytes);
      typeList1.push("bytes");
      typeList2.push("address");
    }

    // error signer
    const signature = await getSignature(
      changedSigner,
      [owners, valueList],
      ["address[]", "bytes[]"],
    );

    await expect(
      LXDAOBuidler.batchUpdateMetadata(tokenIds, valueList, signature),
    ).to.be.revertedWith(
      "VM Exception while processing transaction: reverted with reason string 'LXDAOBuidler: Invalid signature.'",
    );
  });

  it("mint test #7 - update lxPoints", async function () {
    const {
      LXDAOBuidler,
      LXDAOBuidlerMetadata,
      changedSigner,
      originalSigner,
    } = await loadFixture(deployLXDAOBuidlerFixture);

    await buidlerMint();

    // set resource token owner
    await LXDAOBuidlerMetadata.updateController(LXDAOBuidler.address);

    const bytes = bs58.decode(ipfsHash).slice(2);

    const signature = await getSignature(originalSigner, [bytes], ["bytes"]);

    await LXDAOBuidlerMetadata.updateLXPointsURI(bytes, signature);

    // await expect(
    //   LXDAOBuidlerMetadata.updateLXPointsURI(bytes, signature),
    // ).to.be.revertedWith(
    //   "VM Exception while processing transaction: reverted with reason string 'LXDAOBuidlerMetadata: Invalid signature.'",
    // );
  });

  it("mint test #8 - activate failed due to status", async function () {
    const { LXDAOBuidler, buidler } = await loadFixture(
      deployLXDAOBuidlerFixture,
    );

    await buidlerMint();
    const tokenId = await LXDAOBuidler.tokenIdOfOwner(buidler.address);

    await expect(LXDAOBuidler.activate(tokenId)).to.be.revertedWith(
      "VM Exception while processing transaction: reverted with reason string 'LXDAOBuidler: The buidler is not suspended or archived now.'",
    );
  });

  it("mint test #9 - suspend failed due to status", async function () {
    const { LXDAOBuidler, buidler } = await loadFixture(
      deployLXDAOBuidlerFixture,
    );

    await buidlerMint();
    const tokenId = await LXDAOBuidler.tokenIdOfOwner(buidler.address);
    await LXDAOBuidler.suspend(tokenId);

    await expect(LXDAOBuidler.suspend(tokenId)).to.be.revertedWith(
      "VM Exception while processing transaction: reverted with reason string 'LXDAOBuidler: The buidler is not activating now.'",
    );
  });

  it("mint test #10 - archive failed due to status", async function () {
    const { LXDAOBuidler, buidler } = await loadFixture(
      deployLXDAOBuidlerFixture,
    );

    await buidlerMint();
    const tokenId = await LXDAOBuidler.tokenIdOfOwner(buidler.address);
    await LXDAOBuidler.suspend(tokenId);

    await expect(LXDAOBuidler.archive(tokenId)).to.be.revertedWith(
      "VM Exception while processing transaction: reverted with reason string 'LXDAOBuidler: The buidler is not activating now.'",
    );
  });

  it("mint test #11 - forbid approve.", async function () {
    const { LXDAOBuidler, buidler, otherBuidler } = await loadFixture(
      deployLXDAOBuidlerFixture,
    );

    await buidlerMint();
    let tokenId = LXDAOBuidler.tokenIdOfOwner(buidler.address);

    await expect(
      LXDAOBuidler.approve(otherBuidler.address, tokenId),
    ).to.be.revertedWith("LXDAOBuidler: Cannot approve.");
  });

  it("mint test #12 - forbid setApprovalForAll.", async function () {
    const { LXDAOBuidler, otherBuidler } = await loadFixture(
      deployLXDAOBuidlerFixture,
    );

    await expect(
      LXDAOBuidler.setApprovalForAll(otherBuidler.address, true),
    ).to.be.revertedWith("LXDAOBuidler: Cannot setApprovalForAll.");
  });

  it("mint test #13 - transfer failed due to status", async function () {
    const { LXDAOBuidler, buidler, otherBuidler } = await loadFixture(
      deployLXDAOBuidlerFixture,
    );

    await buidlerMint();

    const tokenId = await LXDAOBuidler.tokenIdOfOwner(buidler.address);

    await expect(
      LXDAOBuidler.transferFrom(buidler.address, otherBuidler.address, tokenId),
    ).to.be.revertedWith(
      "VM Exception while processing transaction: reverted with reason string 'LXDAOBuidler: The Active or archived token cannot be transfer.'",
    );
  });

  it("mint test #14 - read empty token id", async function () {
    const { LXDAOBuidler } = await loadFixture(deployLXDAOBuidlerFixture);
    expect(await LXDAOBuidler.tokenURI(0)).to.equal("");
  });

  it("mint test #15 - read token uri", async function () {
    const { LXDAOBuidler, LXDAOBuidlerMetadata, originalSigner, buidler } =
      await loadFixture(deployLXDAOBuidlerFixture);

    await buidlerMint();

    await LXDAOBuidlerMetadata.updateController(LXDAOBuidler.address);

    const tokenId = await LXDAOBuidler.tokenIdOfOwner(buidler.address);

    const bytes = bs58.decode(ipfsHash).slice(2);

    const signature = await getSignature(
      originalSigner,
      [bytes, buidler.address],
      ["bytes", "address"],
    );

    await LXDAOBuidler.connect(buidler).updateMetadata(
      tokenId,
      bytes,
      signature,
    );

    expect(await LXDAOBuidler.tokenURI(tokenId)).to.equal(fileIPFSURI);
  });

  it("mint test #16 - Change metadata signer ", async function () {
    const { LXDAOBuidlerMetadata, changedSigner } = await loadFixture(
      deployLXDAOBuidlerFixture,
    );

    await LXDAOBuidlerMetadata.setSigner(changedSigner.address);
    expect(await LXDAOBuidlerMetadata.getSigner()).to.be.equal(
      changedSigner.address,
    );
  });

  it("mint test #17 - read lxPoints uri", async function () {
    const { LXDAOBuidler, LXDAOBuidlerMetadata, originalSigner } =
      await loadFixture(deployLXDAOBuidlerFixture);

    await buidlerMint();

    await LXDAOBuidlerMetadata.updateController(LXDAOBuidler.address);

    const bytes = bs58.decode(ipfsHash).slice(2);

    const signature = await getSignature(originalSigner, [bytes], ["bytes"]);

    await LXDAOBuidlerMetadata.updateLXPointsURI(bytes, signature);

    expect(await LXDAOBuidlerMetadata.lxPointsURI()).to.equal(fileIPFSURI);
  });

  it("mint test #18 - Change resource base uri", async function () {
    const { LXDAOBuidler, LXDAOBuidlerMetadata } = await loadFixture(
      deployLXDAOBuidlerFixture,
    );

    const newBaseURI = "https://";
    await LXDAOBuidlerMetadata.updateBaseURI(newBaseURI);

    expect(await LXDAOBuidlerMetadata.baseURI()).to.equal(newBaseURI);
  });

  it("mint test #19 - transfer", async function () {
    const { LXDAOBuidler, buidler, otherBuidler } = await loadFixture(
      deployLXDAOBuidlerFixture,
    );

    await buidlerMint();

    const tokenId = await LXDAOBuidler.tokenIdOfOwner(buidler.address);
    await LXDAOBuidler.suspend(tokenId);

    await LXDAOBuidler.transferFrom(
      buidler.address,
      otherBuidler.address,
      tokenId,
    );

    expect(await LXDAOBuidler.balanceOf(otherBuidler.address)).to.be.equal(1);
  });

  it("mint test #20 - set status", async function () {
    const { LXDAOBuidler, buidler } = await loadFixture(
      deployLXDAOBuidlerFixture,
    );

    await buidlerMint();

    const tokenId = await LXDAOBuidler.tokenIdOfOwner(buidler.address);

    expect(await LXDAOBuidler.buidlerStatuses(tokenId)).to.be.equal(1);

    await LXDAOBuidler.suspend(tokenId);
    expect(await LXDAOBuidler.buidlerStatuses(tokenId)).to.be.equal(2);

    await LXDAOBuidler.activate(tokenId);
    expect(await LXDAOBuidler.buidlerStatuses(tokenId)).to.be.equal(1);

    await LXDAOBuidler.archive(tokenId);
    expect(await LXDAOBuidler.buidlerStatuses(tokenId)).to.be.equal(3);
  });
});
