const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NotaryRegistry", function () {
    let notaryRegistry;
    let multiSig, notary1, notary2, unauthorized;

    beforeEach(async function () {
        [multiSig, notary1, notary2, unauthorized] = await ethers.getSigners();

        const NotaryRegistry = await ethers.getContractFactory("NotaryRegistry");
        notaryRegistry = await NotaryRegistry.deploy(multiSig.address);
        await notaryRegistry.waitForDeployment();
    });

    describe("Initialization", function () {
        it("Should set the correct owner (MultiSig)", async function () {
            expect(await notaryRegistry.owner()).to.equal(multiSig.address);
        });
    });

    describe("Access Control", function () {
        it("Should allow owner to add notary", async function () {
            await expect(notaryRegistry.connect(multiSig).addNotary(notary1.address))
                .to.emit(notaryRegistry, "NotaryAdded")
                .withArgs(notary1.address, anyTimestamp(), multiSig.address);

            expect(await notaryRegistry.isNotary(notary1.address)).to.be.true;
        });

        it("Should prevent unauthorized from adding notary", async function () {
            await expect(notaryRegistry.connect(unauthorized).addNotary(notary1.address))
                .to.be.revertedWithCustomError(notaryRegistry, "OwnableUnauthorizedAccount");
        });
    });

    describe("Notary Management & Audit", function () {
        beforeEach(async function () {
            await notaryRegistry.connect(multiSig).addNotary(notary1.address);
        });

        it("Should store correct metadata", async function () {
            const [active, addedAt, addedBy] = await notaryRegistry.getNotary(notary1.address);
            expect(active).to.be.true;
            expect(addedAt).to.be.gt(0);
            expect(addedBy).to.equal(multiSig.address);
        });

        it("Should allow removing notary", async function () {
            await expect(notaryRegistry.connect(multiSig).removeNotary(notary1.address))
                .to.emit(notaryRegistry, "NotaryRemoved");

            expect(await notaryRegistry.isNotary(notary1.address)).to.be.false;
        });

        it("Should track total count properly", async function () {
            await notaryRegistry.connect(multiSig).addNotary(notary2.address);
            expect(await notaryRegistry.getNotaryCount()).to.equal(2);
        });
    });
});

function anyTimestamp() {
    return (val) => val > 0;
}
