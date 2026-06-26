const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("MultiSig Submit Test", function () {
    it("Should successfully submit transaction", async function () {
        const [owner] = await ethers.getSigners();
        
        const BBSNSMultiSig = await ethers.getContractFactory("BBSNSMultiSig");
        const multisig = await BBSNSMultiSig.deploy([owner.address], 1, 0);
        await multisig.waitForDeployment();
        
        console.log("Deployed locally at:", await multisig.getAddress());
        console.log("Owner address:", owner.address);
        console.log("Is signer:", await multisig.isSigner(owner.address));
        
        const toArray = ["0xED95f2ca63FE854694b6eCB180F102daDBC12864"];
        const valueArray = [0];
        const dataArray = ["0x"];
        const proposalHash = ethers.ZeroHash;
        
        const tx = await multisig.submitTransaction(
            toArray,
            valueArray,
            dataArray,
            proposalHash
        );
        const receipt = await tx.wait();
        console.log("Transaction successfully submitted! Gas used:", receipt.gasUsed.toString());
        
        expect(await multisig.getTransactionCount()).to.equal(1n);
    });
});
