const hardhat = require("hardhat");
const abi = require("../artifacts/contracts/BuyMeACoffee.sol/BuyMeACoffee.json");

async function getBalance(provider, address) {
  const balanceBigInt = await provider.getBalance(address);
  return hardhat.ethers.utils.formatEther(balanceBigInt);
}

const contractAddress = process.env.CONTRACT_ADDRESS;
const apiKey = process.env.ALCHEMY_API_KEY;
const privateKey = process.env.PRIVATE_KEY;

async function main() {
  // Get the contract that has been deployed to Goerli.
  const contractABI = abi.abi;

  // Get the node connection and wallet connection.
  // provider 를 명시적으로 정해주고있을 때 에는 --network 로 지정을 따로 해줄 필요가 없다.
  const provider = new hardhat.ethers.providers.AlchemyProvider("goerli", apiKey);

  // Ensure that signer is the SAME address as the original contract deployer,
  // or else this script will fail with an error.
  const signer = new hardhat.ethers.Wallet(privateKey, provider);

  // Instantiate connected contract.
  const buyMeACoffee = new hardhat.ethers.Contract(contractAddress, contractABI, signer);

  // Check starting balances.
  console.log("current balance of owner: ", await getBalance(provider, signer.address), "ETH");
  const contractBalance = await getBalance(provider, buyMeACoffee.address);
  console.log("current balance of contract: ", await getBalance(provider, buyMeACoffee.address), "ETH");

  // Withdraw funds if there are funds to withdraw.
  if (contractBalance !== "0.0") {
    console.log("withdrawing funds..")
    const withdrawTxn = await buyMeACoffee.withdrawTips();
    await withdrawTxn.wait();
  } else {
    console.log("no funds to withdraw!");
  }

  // Check ending balance.
  console.log("current balance of owner: ", await getBalance(provider, signer.address), "ETH");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });