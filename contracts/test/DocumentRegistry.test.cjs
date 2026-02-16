const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DocumentRegistry (EIP-712)", function () {
    let docRegistry, notaryRegistry;
    let admin, notary, relayer, nonNotary;
    let chainId;

    beforeEach(async function () {
        [admin, notary, relayer, nonNotary] = await ethers.getSigners();
        chainId = (await ethers.provider.getNetwork()).chainId;

        // 1. Deploy NotaryRegistry
        const NotaryRegistry = await ethers.getContractFactory("NotaryRegistry");
        notaryRegistry = await NotaryRegistry.deploy(admin.address);
        await notaryRegistry.waitForDeployment();

        // 2. Authorize Notary
        await notaryRegistry.connect(admin).addNotary(notary.address);

        // 3. Deploy DocumentRegistry
        const DocumentRegistry = await ethers.getContractFactory("DocumentRegistry");
        docRegistry = await DocumentRegistry.deploy(admin.address, await notaryRegistry.getAddress());
        await docRegistry.waitForDeployment();
    });

    /**
     * Helper to generate EIP-712 signature for Notarize action
     */
    async function getNotarizeSignature(signer, docHash, status, timestamp) {
        const domain = {
            name: "BBSNS_Protocol",
            version: "1",
            chainId: chainId,
            verifyingContract: await docRegistry.getAddress()
        };

        const types = {
            Notarize: [
                { name: "docHash", type: "bytes32" },
                { name: "status", type: "uint8" },
                { name: "timestamp", type: "uint256" }
            ]
        };

        const value = {
            docHash: docHash,
            status: status,
            timestamp: timestamp
        };

        return await signer.signTypedData(domain, types, value);
    }

    describe("EIP-712 Notarization", function () {
        const docHash = ethers.id("test-document-content");
        const status = 1; // APPROVED

        it("Should allow valid notarization via EIP-712 signature", async function () {
            const timestamp = await time.latest();
            const signature = await getNotarizeSignature(notary, docHash, status, timestamp);

            // Relayer submits the action
            await expect(docRegistry.connect(relayer).recordAction(docHash, status, timestamp, signature))
                .to.emit(docRegistry, "DocumentRecorded")
                .withArgs(docHash, notary.address, status, anyTimestamp());

            const doc = await docRegistry.getDocument(docHash);
            expect(doc.notary).to.equal(notary.address);
            expect(doc.status).to.equal(status);
            expect(doc.exists).to.be.true;
        });

        it("Should reject signature from non-authorized notary", async function () {
            const timestamp = await time.latest();
            const signature = await getNotarizeSignature(nonNotary, docHash, status, timestamp);

            await expect(docRegistry.connect(relayer).recordAction(docHash, status, timestamp, signature))
                .to.be.revertedWith("DocumentRegistry: Signer is not an authorized Notary");
        });

        it("Should prevent signature replay", async function () {
            const timestamp = await time.latest();
            const signature = await getNotarizeSignature(notary, docHash, status, timestamp);

            await docRegistry.connect(relayer).recordAction(docHash, status, timestamp, signature);

            // Try to use the SAME signature again for a different docHash (will fail digest check)
            // Try to use the SAME signature for SAME docHash (will fail "!exists" check)
            await expect(docRegistry.connect(relayer).recordAction(docHash, status, timestamp, signature))
                .to.be.revertedWith("DocumentRegistry: Record already exists");

            // Try to use the SAME signature to submit a different docHash (Digest change)
            const docHash2 = ethers.id("different-doc");
            await expect(docRegistry.connect(relayer).recordAction(docHash2, status, timestamp, signature))
                .to.be.reverted; // Signature won't recover to the same notary for different data
        });

        it("Should reject expired signatures (24h window)", async function () {
            const timestamp = (await time.latest()) - (24 * 3600 + 60); // 24h 1m ago
            const signature = await getNotarizeSignature(notary, docHash, status, timestamp);

            await expect(docRegistry.connect(relayer).recordAction(docHash, status, timestamp, signature))
                .to.be.revertedWith("DocumentRegistry: Signature expired");
        });
    });

    describe("Circuit Breaker", function () {
        it("Should prevent actions when paused", async function () {
            await docRegistry.connect(admin).pause();

            const docHash = ethers.id("paused-doc");
            const timestamp = await time.latest();
            const signature = await getNotarizeSignature(notary, docHash, 1, timestamp);

            await expect(docRegistry.connect(relayer).recordAction(docHash, 1, timestamp, signature))
                .to.be.revertedWithCustomError(docRegistry, "EnforcedPause");
        });

        it("Should allow actions after unpausing", async function () {
            await docRegistry.connect(admin).pause();
            await docRegistry.connect(admin).unpause();

            const docHash = ethers.id("unpaused-doc");
            const timestamp = await time.latest();
            const signature = await getNotarizeSignature(notary, docHash, 1, timestamp);

            await expect(docRegistry.recordAction(docHash, 1, timestamp, signature))
                .to.emit(docRegistry, "DocumentRecorded");
        });
    });
});

function anyTimestamp() {
    return (val) => val > 0;
}
