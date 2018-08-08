var OPCToken = artifacts.require("OPCToken");

contract('OPCToken', function(accounts) {

    const owner = accounts[0];


    // Deploys a new contract for each test
    let opcToken;
    beforeEach(async () => {
        opcToken = await OPCToken.new();

    });
    it("any C level address can open the contract for applications", async () => {
        assert.equal(await opcToken.open(), false);

        await opcToken.openApplications({from: owner});
        assert.equal(await opcToken.open(), true);
    });
    it("any C level address can close the contract for applications", async () => {
        assert.equal(await opcToken.open(), false);

        await opcToken.openApplications({from: owner});
        assert.equal(await opcToken.open(), true);

        await opcToken.closeFunding({from: owner});
        assert.equal(await opcToken.open(), false);
    });
    it("should prevent other accounts from opening and closing applications", async () => {
        assert.equal(await opcToken.open(), false);

        await opcToken.openApplications({from: owner});
        assert.equal(await opcToken.open(), true);

        await opcToken.closeFunding({from: owner});
        assert.equal(await opcToken.open(), false);

        try {
            await opcToken.openApplications({from: accounts[3]});
        } catch (e) {

        }
        assert.equal(await opcToken.open(), false);
    });


});
