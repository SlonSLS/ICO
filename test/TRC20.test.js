const { BN, expectRevert } = require('@openzeppelin/test-helpers');
const TRC20 = artifacts.require('TRC20');

contract('TRC20', (accounts) => {
  const [owner, spender] = accounts;

  it('should approve spender correctly', async () => {
    const contractInstance = await TRC20.deployed();
    const approveAmount = new BN(100);

    await contractInstance.approve(spender, approveAmount, { from: owner });
    const allowance = await contractInstance.allowance(owner, spender);

    assert(allowance.eq(approveAmount), 'Allowance not set correctly');
  });

  it('should not allow approval of zero tokens', async () => {
    const contractInstance = await TRC20.deployed();

    await expectRevert(
      contractInstance.approve(spender, new BN(0), { from: owner }),
      'revert'
    );
  });

  // Add more test cases as needed
});
