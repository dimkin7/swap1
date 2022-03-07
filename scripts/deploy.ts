import { ethers } from "hardhat";

async function main() {
  //деплой
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const factory = await ethers.getContractFactory("StakeLPToken");

  const dimaToken = "0xa2aaE6F6cBd2D7A8F465eF194f5812d8FbF6899b";
  const uni_V2 = "0xE41945b3008a3Ea0272bDD4C52B2F5Af55eE1b41";
  const admin = deployer.address; //0x7EA751f8B46E08F7397904A39b3e08901B5D1659

  //constructor(address _lpTokenAddr, address _rewardTokenAddr, address _admin) {
  const contract = await factory.deploy(uni_V2, dimaToken, admin);
  await contract.deployed();
  console.log("Contract deployed to:", contract.address);
  //Contract deployed to: 0xC55D91Cc3A1a574bd66A890Ea9f9477eD5dC7d7d
}

//запуск
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
