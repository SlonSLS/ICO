const { BN, expectRevert } = require('@openzeppelin/test-helpers');
const SharesSlonPlus = artifacts.require('SharesSlonPlus');

contract('SharesSlonPlus', (accounts) => {
  const [creator, user1, user2] = accounts;
  
  it('should transfer tokens correctly', async () => {
    const contractInstance = await SharesSlonPlus.deployed();
    const initialBalanceCreator = await contractInstance.balanceOf(creator);
    const transferAmount = new BN(100);

    // Transfer tokens from creator to user1
    await contractInstance.transfer(user1, transferAmount, { from: creator });
    const balanceUser1 = await contractInstance.balanceOf(user1);
    const balanceCreator = await contractInstance.balanceOf(creator);

    assert(balanceUser1.eq(transferAmount), 'Tokens were not transferred correctly');
    assert(balanceCreator.eq(initialBalanceCreator.sub(transferAmount)), 'Creator balance not updated correctly');
  });

  it('should not allow transfer to the zero address', async () => {
    const contractInstance = await SharesSlonPlus.deployed();

    await expectRevert(
      contractInstance.transfer('0x0000000000000000000000000000000000000000', new BN(100), { from: creator }),
      'revert'
    );
  });

  it('should not allow transfer of zero tokens', async () => {
    const contractInstance = await SharesSlonPlus.deployed();

    await expectRevert(
      contractInstance.transfer(user1, new BN(0), { from: creator }),
      'revert'
    );
  });

  // Add more test cases as needed
});
