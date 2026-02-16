const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("NTKToken", function () {
    let ntkToken;
    let admin, relayer, notary1, notary2, unauthorized;
    let RELAYER_ROLE;
    let DEFAULT_ADMIN_ROLE;

    beforeEach(async function () {
        [admin, relayer, notary1, notary2, unauthorized] = await ethers.getSigners();

        const NTKToken = await ethers.getContractFactory("NTKToken");
        ntkToken = await NTKToken.deploy(relayer.address);
        await ntkToken.waitForDeployment();

        RELAYER_ROLE = await ntkToken.RELAYER_ROLE();
        DEFAULT_ADMIN_ROLE = await ntkToken.DEFAULT_ADMIN_ROLE();
    });

    describe("Deployment", function () {
        it("Should set the correct name and symbol", async function () {
            expect(await ntkToken.name()).to.equal("Notary Action Token");
            expect(await ntkToken.symbol()).to.equal("NTK");
        });

        it("Should grant DEFAULT_ADMIN_ROLE to deployer", async function () {
            expect(await ntkToken.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
        });

        it("Should grant RELAYER_ROLE to initial relayer", async function () {
            expect(await ntkToken.hasRole(RELAYER_ROLE, relayer.address)).to.be.true;
        });

        it("Should have correct constants", async function () {
            expect(await ntkToken.DAILY_NTK()).to.equal(ethers.parseEther("100"));
            expect(await ntkToken.DAY()).to.equal(86400); // 1 day in seconds
            expect(await ntkToken.COST_PER_ACTION()).to.equal(ethers.parseEther("1"));
        });
    });

    describe("RELAYER_ROLE Enforcement", function () {
        it("Should allow relayer to mint daily NTK", async function () {
            const tx = await ntkToken.connect(relayer).mintDailyNTK(notary1.address);
            const receipt = await tx.wait();

            // Check event was emitted
            await expect(tx)
                .to.emit(ntkToken, "DailyNTKMinted")
                .withArgs(notary1.address, ethers.parseEther("100"), await ntkToken.lastDailyMint(notary1.address));

            expect(await ntkToken.balanceOf(notary1.address)).to.equal(ethers.parseEther("100"));
        });

        it("Should prevent non-relayer from minting", async function () {
            await expect(
                ntkToken.connect(unauthorized).mintDailyNTK(notary1.address)
            ).to.be.revertedWithCustomError(ntkToken, "AccessControlUnauthorizedAccount");
        });

        it("Should allow admin to grant RELAYER_ROLE", async function () {
            await ntkToken.connect(admin).grantRole(RELAYER_ROLE, unauthorized.address);
            expect(await ntkToken.hasRole(RELAYER_ROLE, unauthorized.address)).to.be.true;

            // New relayer should be able to mint
            await expect(ntkToken.connect(unauthorized).mintDailyNTK(notary1.address))
                .to.emit(ntkToken, "DailyNTKMinted");
        });

        it("Should allow admin to revoke RELAYER_ROLE", async function () {
            await ntkToken.connect(admin).revokeRole(RELAYER_ROLE, relayer.address);
            expect(await ntkToken.hasRole(RELAYER_ROLE, relayer.address)).to.be.false;

            // Revoked relayer should not be able to mint
            await expect(
                ntkToken.connect(relayer).mintDailyNTK(notary1.address)
            ).to.be.revertedWithCustomError(ntkToken, "AccessControlUnauthorizedAccount");
        });
    });

    describe("24-Hour Guard", function () {
        it("Should allow first mint", async function () {
            await ntkToken.connect(relayer).mintDailyNTK(notary1.address);
            expect(await ntkToken.balanceOf(notary1.address)).to.equal(ethers.parseEther("100"));
        });

        it("Should prevent second mint within 24 hours", async function () {
            // First mint
            await ntkToken.connect(relayer).mintDailyNTK(notary1.address);

            // Attempt second mint immediately
            await expect(
                ntkToken.connect(relayer).mintDailyNTK(notary1.address)
            ).to.be.revertedWith("Daily NTK already issued");

            // Try after 23 hours (still within 24h)
            await time.increase(23 * 60 * 60);
            await expect(
                ntkToken.connect(relayer).mintDailyNTK(notary1.address)
            ).to.be.revertedWith("Daily NTK already issued");
        });

        it("Should allow mint after 24 hours", async function () {
            // First mint
            await ntkToken.connect(relayer).mintDailyNTK(notary1.address);
            expect(await ntkToken.balanceOf(notary1.address)).to.equal(ethers.parseEther("100"));

            // Advance time by 24 hours + 1 second
            await time.increase(24 * 60 * 60 + 1);

            // Second mint should succeed
            await expect(ntkToken.connect(relayer).mintDailyNTK(notary1.address))
                .to.emit(ntkToken, "DailyNTKMinted");

            expect(await ntkToken.balanceOf(notary1.address)).to.equal(ethers.parseEther("200"));
        });

        it("Should track lastDailyMint correctly", async function () {
            const tx = await ntkToken.connect(relayer).mintDailyNTK(notary1.address);
            const receipt = await tx.wait();
            const block = await ethers.provider.getBlock(receipt.blockNumber);

            expect(await ntkToken.lastDailyMint(notary1.address)).to.equal(block.timestamp);
        });

        it("Should handle multiple notaries independently", async function () {
            // Mint for notary1
            await ntkToken.connect(relayer).mintDailyNTK(notary1.address);

            // Mint for notary2 immediately (should work, different notary)
            await ntkToken.connect(relayer).mintDailyNTK(notary2.address);

            expect(await ntkToken.balanceOf(notary1.address)).to.equal(ethers.parseEther("100"));
            expect(await ntkToken.balanceOf(notary2.address)).to.equal(ethers.parseEther("100"));

            // notary1 cannot mint again
            await expect(
                ntkToken.connect(relayer).mintDailyNTK(notary1.address)
            ).to.be.revertedWith("Daily NTK already issued");

            // notary2 cannot mint again
            await expect(
                ntkToken.connect(relayer).mintDailyNTK(notary2.address)
            ).to.be.revertedWith("Daily NTK already issued");
        });
    });

    describe("Burn on Action", function () {
        beforeEach(async function () {
            // Give notary1 some NTK
            await ntkToken.connect(relayer).mintDailyNTK(notary1.address);
        });

        it("Should allow relayer to burn NTK for action", async function () {
            await expect(ntkToken.connect(relayer).burnForAction(notary1.address))
                .to.emit(ntkToken, "NTKBurnedForAction")
                .withArgs(notary1.address, ethers.parseEther("1"));

            expect(await ntkToken.balanceOf(notary1.address)).to.equal(ethers.parseEther("99"));
        });

        it("Should prevent non-relayer from burning", async function () {
            await expect(
                ntkToken.connect(unauthorized).burnForAction(notary1.address)
            ).to.be.revertedWithCustomError(ntkToken, "AccessControlUnauthorizedAccount");
        });

        it("Should fail if notary has 0 NTK", async function () {
            // Burn all 100 NTK
            for (let i = 0; i < 100; i++) {
                await ntkToken.connect(relayer).burnForAction(notary1.address);
            }

            expect(await ntkToken.balanceOf(notary1.address)).to.equal(0);

            // Next burn should fail
            await expect(
                ntkToken.connect(relayer).burnForAction(notary1.address)
            ).to.be.revertedWithCustomError(ntkToken, "ERC20InsufficientBalance");
        });

        it("Should burn exactly 1 NTK per action", async function () {
            const initialBalance = await ntkToken.balanceOf(notary1.address);

            await ntkToken.connect(relayer).burnForAction(notary1.address);

            const finalBalance = await ntkToken.balanceOf(notary1.address);
            expect(initialBalance - finalBalance).to.equal(ethers.parseEther("1"));
        });
    });

    describe("Integration Flow", function () {
        it("Should support Mint → Burn → Mint (next day) flow", async function () {
            // Day 1: Mint
            await ntkToken.connect(relayer).mintDailyNTK(notary1.address);
            expect(await ntkToken.balanceOf(notary1.address)).to.equal(ethers.parseEther("100"));

            // Day 1: Perform 5 actions
            for (let i = 0; i < 5; i++) {
                await ntkToken.connect(relayer).burnForAction(notary1.address);
            }
            expect(await ntkToken.balanceOf(notary1.address)).to.equal(ethers.parseEther("95"));

            // Day 2: Advance time and mint again
            await time.increase(24 * 60 * 60 + 1);
            await ntkToken.connect(relayer).mintDailyNTK(notary1.address);
            expect(await ntkToken.balanceOf(notary1.address)).to.equal(ethers.parseEther("195"));

            // Day 2: Perform more actions
            for (let i = 0; i < 10; i++) {
                await ntkToken.connect(relayer).burnForAction(notary1.address);
            }
            expect(await ntkToken.balanceOf(notary1.address)).to.equal(ethers.parseEther("185"));
        });

        it("Should enforce work throttling when NTK runs out", async function () {
            // Mint 100 NTK
            await ntkToken.connect(relayer).mintDailyNTK(notary1.address);

            // Perform 100 actions (burn all NTK)
            for (let i = 0; i < 100; i++) {
                await ntkToken.connect(relayer).burnForAction(notary1.address);
            }

            expect(await ntkToken.balanceOf(notary1.address)).to.equal(0);

            // Cannot perform more actions until next day
            await expect(
                ntkToken.connect(relayer).burnForAction(notary1.address)
            ).to.be.revertedWithCustomError(ntkToken, "ERC20InsufficientBalance");

            // Cannot mint again same day
            await expect(
                ntkToken.connect(relayer).mintDailyNTK(notary1.address)
            ).to.be.revertedWith("Daily NTK already issued");

            // Next day: can mint and work again
            await time.increase(24 * 60 * 60 + 1);
            await ntkToken.connect(relayer).mintDailyNTK(notary1.address);
            await ntkToken.connect(relayer).burnForAction(notary1.address);
            expect(await ntkToken.balanceOf(notary1.address)).to.equal(ethers.parseEther("99"));
        });
        describe("Pausable Support", function () {
            it("Should allow admin to pause and unpause", async function () {
                await ntkToken.connect(admin).pause();
                expect(await ntkToken.paused()).to.be.true;

                await ntkToken.connect(admin).unpause();
                expect(await ntkToken.paused()).to.be.false;
            });

            it("Should prevent minting and burning when paused", async function () {
                await ntkToken.connect(admin).pause();

                await expect(ntkToken.connect(relayer).mintDailyNTK(notary1.address))
                    .to.be.revertedWithCustomError(ntkToken, "EnforcedPause");

                await expect(ntkToken.connect(relayer).burnForAction(notary1.address))
                    .to.be.revertedWithCustomError(ntkToken, "EnforcedPause");
            });

            it("Should prevent non-admin from pausing", async function () {
                await expect(ntkToken.connect(unauthorized).pause())
                    .to.be.revertedWithCustomError(ntkToken, "AccessControlUnauthorizedAccount");
            });
        });
    });
});
