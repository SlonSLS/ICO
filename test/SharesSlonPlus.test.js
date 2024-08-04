const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const SharesSlonPlus = artifacts.require('SharesSlonPlus');

contract('SharesSlonPlus', (accounts) => {
  const [creator, user1, user2, newOwner] = accounts;

  let contractInstance;

  beforeEach(async () => {
    contractInstance = await SharesSlonPlus.new({ from: creator });
  });

  it('should transfer tokens correctly', async () => {
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
    await expectRevert(
      contractInstance.transfer('0x0000000000000000000000000000000000000000', new BN(100), { from: creator }),
      'Cannot transfer to the zero address'
    );
  });

  it('should not allow transfer of zero tokens', async () => {
    await expectRevert(
      contractInstance.transfer(user1, new BN(0), { from: creator }),
      'Insufficient balance'
    );
  });

  it('should approve allowance correctly', async () => {
    const allowanceAmount = new BN(200);
    const receipt = await contractInstance.approve(user1, allowanceAmount, { from: creator });

    const allowance = await contractInstance.allowance(creator, user1);
    assert(allowance.eq(allowanceAmount), 'Allowance was not set correctly');

    expectEvent(receipt, 'Approval', {
      tokenOwner: creator,
      spender: user1,
      tokens: allowanceAmount
    });
  });

  it('should not allow transferFrom to the zero address', async () => {
    const transferAmount = new BN(100);
    await contractInstance.approve(user1, transferAmount, { from: creator });

    await expectRevert(
      contractInstance.transferFrom(creator, '0x0000000000000000000000000000000000000000', transferAmount, { from: user1 }),
      'Cannot transfer to the zero address'
    );
  });

  it('should handle buyTokens correctly', async () => {
    const tokenPrice = await contractInstance.TokenPrice();
    const buyAmount = new BN(1); // Buy 1 token
    const value = tokenPrice.mul(buyAmount); // Amount of ether to send

    await contractInstance.buyTokens({ from: user1, value });

    const balanceUser1 = await contractInstance.balanceOf(user1);
    assert(balanceUser1.eq(buyAmount), 'Tokens were not purchased correctly');
  });

  it('should handle sellTokens correctly', async () => {
    const tokenPrice = await contractInstance.TokenPrice();
    const sellAmount = new BN(1); // Sell 1 token
    const value = tokenPrice.mul(sellAmount); // Amount of ether to receive

    // Transfer tokens to user1 to sell
    await contractInstance.transfer(user1, sellAmount, { from: creator });

    const initialBalance = await web3.eth.getBalance(user1);
    await contractInstance.sellTokens(sellAmount, { from: user1 });

    const balanceUser1 = await contractInstance.balanceOf(user1);
    const newBalance = await web3.eth.getBalance(user1);

    assert(balanceUser1.isZero(), 'Tokens were not sold correctly');
    assert(new BN(newBalance).gt(new BN(initialBalance)), 'Ether was not transferred correctly');
  });

  it('should pause and unpause the contract', async () => {
    await contractInstance.pause({ from: creator });
    assert(await contractInstance.paused(), 'Contract was not paused');

    await expectRevert(
      contractInstance.buyTokens({ from: user1, value: new BN(1) }),
      'Contract is paused'
    );

    await contractInstance.unpause({ from: creator });
    assert(!(await contractInstance.paused()), 'Contract was not unpaused');

    const tokenPrice = await contractInstance.TokenPrice();
    const buyAmount = new BN(1);
    const value = tokenPrice.mul(buyAmount);

    await contractInstance.buyTokens({ from: user1, value });
    const balanceUser1 = await contractInstance.balanceOf(user1);
    assert(balanceUser1.eq(buyAmount), 'Tokens were not purchased correctly after unpausing');
  });

  it('should handle ownership transfer', async () => {
    await contractInstance.transferOwnership(newOwner, { from: creator });
    assert.equal(await contractInstance.newOwner(), newOwner, 'New owner was not set correctly');

    await contractInstance.acceptOwnership({ from: newOwner });
    assert.equal(await contractInstance.owner(), newOwner, 'Ownership was not transferred correctly');
    assert.equal(await contractInstance.newOwner(), '0x0000000000000000000000000000000000000000', 'New owner was not reset correctly');
  });
});
