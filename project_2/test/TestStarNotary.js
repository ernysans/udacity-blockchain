const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
  accounts = accs;
  owner = accounts[0];
});

it('can Create a Star', async () => {
  let tokenId = 1;
  let instance = await StarNotary.deployed();
  await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
  assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let starId = 2;
  let starPrice = web3.utils.toWei(".01", "ether");
  await instance.createStar('awesome star', starId, {from: user1});
  await instance.putStarUpForSale(starId, starPrice, {from: user1});
  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 3;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar('awesome star', starId, {from: user1});
  await instance.putStarUpForSale(starId, starPrice, {from: user1});
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  await instance.buyStar(starId, {from: user2, value: balance});
  console.log('Buy start: Success!!!');
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
  let balanceBefore = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  let balanceAfter = Number(balanceOfUser1AfterTransaction);
  assert.equal(balanceBefore, balanceAfter);
});

it('lets user2 buy a star, if it is put up for sale', async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 4;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar('awesome star', starId, {from: user1});
  await instance.putStarUpForSale(starId, starPrice, {from: user1});
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, {from: user2, value: balance});
  assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 5;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar('awesome star', starId, {from: user1});
  await instance.putStarUpForSale(starId, starPrice, {from: user1});
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, {from: user2, value: balance, gasPrice: 0});
  const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
  let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
  assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async () => {
  // 1. create a Star with different tokenId
  let user1 = accounts[1];
  let starId = 10;
  let instance = await StarNotary.deployed();
  let starName = 'New Star';
  await instance.createStar(starName, starId, {from: user1})
  //2. Call the name and symbol properties in your Smart Contract
  let ContractName = await instance.name();
  let ContractSymbol = await instance.symbol();
  let starNameFromId = await instance.lookUptokenIdToStarInfo(starId);
  // and compare with the name and symbol provided
  assert.equal(ContractName, 'CoolStar');
  assert.equal(ContractSymbol, 'CSTAR');
  assert.equal(starNameFromId, starName);
});

it('lets 2 users exchange stars', async () => {
  // 1. create 2 Stars with different tokenId
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  await instance.createStar('exchange1', 11, {from: user1})
  await instance.createStar('exchange2', 12, {from: user2})
  // 2. Call the exchangeStars functions implemented in the Smart Contract
  await instance.exchangeStars(11, 12, {from: user1});
  // 3. Verify that the owners changed
  let owner1 = await instance.ownerOf(11);
  let owner2 = await instance.ownerOf(12);

  assert.equal(user1, owner2);
  assert.equal(user2, owner1);
});

it('lets a user transfer a star', async () => {
  // 1. create a Star with different tokenId
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starName = 'Transfer Star';
  let starId = 20;
  await instance.createStar(starName, starId, {from: user1})
  // 2. use the transferStar function implemented in the Smart Contract
  await instance.transferStar(user2, starId, {from: user1});
  // 3. Verify the star owner changed.
  let newOwner = await instance.ownerOf(starId);
  assert.equal(user2, newOwner);
});

it('lookUptokenIdToStarInfo test', async () => {
  // 1. create a Star with different tokenId
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let starName = 'LookUp Star';
  await instance.createStar(starName, 15, {from: user1})
  // 2. Call your method lookUptokenIdToStarInfo
  let newStarName = await instance.lookUptokenIdToStarInfo(15);
  // 3. Verify if you Star name is the same
  assert.equal(starName, newStarName);
});
