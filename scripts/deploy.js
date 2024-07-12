const { ethers } = require("ethers");
const SharesSlonPlusArtifact = require("../build/contracts/SharesSlonPlus.json");

async function main() {
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
  const wallet = new ethers.Wallet(privateKey, provider);
  const factory = new ethers.ContractFactory(SharesSlonPlusArtifact.abi, SharesSlonPlusArtifact.bytecode, wallet);

  console.log("Deploying contract...");
  const contract = await factory.deploy();
  await contract.deployed();
  console.log(`Contract deployed at address: ${contract.address}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
