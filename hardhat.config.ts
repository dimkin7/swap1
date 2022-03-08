import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

//это контракт стейкинга
const contractAddr = '0xC55D91Cc3A1a574bd66A890Ea9f9477eD5dC7d7d'; 

//таски на stake, unstake, claim

// stake(uint256 amount) - списывает с пользователя на контракт стейкинга ЛП токены в количестве amount, обновляет в контракте баланс пользователя
//npx hardhat stake --network rinkeby --key PRIVATE_KEY --amount 321
task("stake", "stake")
  .addParam("key", "Your private key")
  .addParam("amount", "amount")
  .setAction(async (taskArgs, hre) => {

    const abi = [
      "function stake(uint256 _amount) public"
    ];
    const provider = new hre.ethers.providers.AlchemyProvider("rinkeby");
    const signer = new hre.ethers.Wallet(taskArgs.key, provider);
    const contr = new hre.ethers.Contract(contractAddr, abi, signer);
    
    let success = await contr.stake(taskArgs.amount);
    console.log('stake: ', success);
  });

// claim() - списывает с контракта стейкинга ревард токены доступные в качестве наград
//npx hardhat claim --network rinkeby --key PRIVATE_KEY 
task("claim", "claim")
  .addParam("key", "Your private key")
  .setAction(async (taskArgs, hre) => {

    const abi = [
      "function claim() public"
    ];
    const provider = new hre.ethers.providers.AlchemyProvider("rinkeby");
    const signer = new hre.ethers.Wallet(taskArgs.key, provider);
    const contr = new hre.ethers.Contract(contractAddr, abi, signer);
    
    let success = await contr.claim();
    console.log('claim: ', success);
  });

// unstake() - списывает с контракта стейкинга ЛП токены доступные для вывода
//npx hardhat unstake --network rinkeby --key PRIVATE_KEY 
task("unstake", "unstake")
  .addParam("key", "Your private key")
  .setAction(async (taskArgs, hre) => {

    const abi = [
      "function unstake() public"
    ];
    const provider = new hre.ethers.providers.AlchemyProvider("rinkeby");
    const signer = new hre.ethers.Wallet(taskArgs.key, provider);
    const contr = new hre.ethers.Contract(contractAddr, abi, signer);
    
    let success = await contr.unstake();
    console.log('unstake: ', success);
  });

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {

    rinkeby: {
      url: process.env.RENKEBY_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },

    //workaround for coverage
    /*hardhat: {
      initialBaseFeePerGas: 0
    },*/
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
