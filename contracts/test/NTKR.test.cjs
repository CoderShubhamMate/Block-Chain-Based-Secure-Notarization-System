const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NTKRToken - Task 2.1 Restricted Relayer Signer", function () {
    let NTKR, ntkr;
    let admin, relayer, user1, user2;
    let RELAYER_ROLE;

    beforeEach(async function () {
        [admin, relayer, user1, user2] = await ethers.getSigners();
        NTKR = await ethers.getContractFactory("NTKRToken");
        // Initial Relayer set to 'relayer' account, Treasury set to 'admin'
        ntkr = await NTKR.deploy(relayer.address, admin.address);
        await ntkr.waitForDeployment();

        RELAYER_ROLE = await ntkr.RELAYER_ROLE();
    });

    it("Should set the correct initial roles", async function () {
        expect(await ntkr.hasRole(await ntkr.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
        expect(await ntkr.hasRole(RELAYER_ROLE, relayer.address)).to.be.true;
        expect(await ntkr.hasRole(RELAYER_ROLE, admin.address)).to.be.false;
    });

    describe("mintNTKR (Relayer Function)", function () {
        it("Should allow relayer to mint tokens to user", async function () {
            const amount = ethers.parseEther("100");
            await ntkr.connect(relayer).mintNTKR(user1.address, amount);
            expect(await ntkr.balanceOf(user1.address)).to.equal(amount);
        });

        it("Should reject minting from non-relayer (even Admin)", async function () {
            const amount = ethers.parseEther("100");
            await expect(ntkr.connect(admin).mintNTKR(user1.address, amount))
                .to.be.revertedWithCustomError(ntkr, "AccessControlUnauthorizedAccount");
        });

        it("Should enforce 24-hour cooldown", async function () {
            const amount = ethers.parseEther("100");
            await ntkr.connect(relayer).mintNTKR(user1.address, amount);

            await expect(ntkr.connect(relayer).mintNTKR(user1.address, amount))
                .to.be.revertedWith("Relayer: Cooldown active");
        });

        it("Should enforce MAX_PER_USER balance limit (500 NTKR)", async function () {
            const amount = ethers.parseEther("501");
            await expect(ntkr.connect(relayer).mintNTKR(user1.address, amount))
                .to.be.revertedWith("Relayer: Max balance exceeded");
        });
    });

    describe("consumeTokens (Relayer Function)", function () {
        beforeEach(async function () {
            // Give user1 some tokens first (via package purchase to simulate real flow)
            await ntkr.connect(user1).buyPackage(1, { value: ethers.parseEther("0.001") });
        });

        it("Should allow relayer to consume tokens for submission", async function () {
            const initialBalance = await ntkr.balanceOf(user1.address);
            const categoryPrice = await ntkr.categoryPrices(0); // BASIC

            await ntkr.connect(relayer).consumeTokens(user1.address, 0);

            expect(await ntkr.balanceOf(user1.address)).to.equal(initialBalance - categoryPrice);
        });

        it("Should reject consumeTokens from non-relayer", async function () {
            await expect(ntkr.connect(user1).consumeTokens(user1.address, 0))
                .to.be.revertedWithCustomError(ntkr, "AccessControlUnauthorizedAccount");
        });
    });
});
