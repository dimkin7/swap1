import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

describe("Test descr", function () {
  let stake: Contract;
  let lpToken: Contract;
  let myToken: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  before(async function () {
    console.log("before");

    [owner, addr1, addr2] = await ethers.getSigners();

    const factoryLPToken = await ethers.getContractFactory("LPTokenTest");
    lpToken = await factoryLPToken.deploy(ethers.BigNumber.from("2000000000000000000000")); //2000
    await lpToken.deployed();

    const factoryMyToken = await ethers.getContractFactory("MyTokenTest");
    myToken = await factoryMyToken.deploy(ethers.BigNumber.from("3000000000000000000000")); //3000
    await myToken.deployed();

    const factoryStake = await ethers.getContractFactory("StakeLPToken");
    //constructor(address _lpTokenAddr, address _rewardTokenAddr, address _admin)
    stake = await factoryStake.deploy(lpToken.address, myToken.address, owner.address);
    await stake.deployed();    
  });

  //beforeEach передеплой контракта
  beforeEach(async function () {
    console.log("beforeEach");

    
  });


  it("test it", async function () {
    console.log("owner:" + owner.address);
    console.log("addr1:" + addr1.address);
    console.log("addr2:" + addr2.address);

    // передаем 
    await lpToken.transfer(addr1.address, 2000); //18 нулей 000000000000000000   ethers.BigNumber.from("200000000000000000000")
    expect(await lpToken.balanceOf(addr1.address)).to.equal(2000);  //баланс 

    // разрешаем контракту списать N токенов
    await lpToken.connect(addr1).approve(stake.address, 2000);
    expect(await lpToken.allowance(addr1.address, stake.address)).to.equal(2000);  //разрешено 

    //положить токены
    await stake.connect(addr1).stake(500);
    expect(await lpToken.balanceOf(stake.address)).to.equal(500);  //баланс
    expect(await lpToken.balanceOf(addr1.address)).to.equal(1500);  //баланс


  });

  it("test it2", async function () {

    //снять 
    await new Promise(resolve => setTimeout(resolve, 20 * 1000));

    await stake.connect(addr1).unstake();
    expect(await lpToken.balanceOf(stake.address)).to.equal(0);  //баланс
    expect(await lpToken.balanceOf(addr1.address)).to.equal(2000);  //баланс

  });

});
