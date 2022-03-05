import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

describe("Test staking for LP tokens", function () {
  this.timeout(120*1000); //ставим таймаут, иначе прерывается через 40 секунд 

  let stake: Contract;
  let lpToken: Contract;
  let myToken: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  before(async function () {
    //console.log("before");

    [owner, addr1, addr2] = await ethers.getSigners();

    //создаем ЛП токены
    const factoryLPToken = await ethers.getContractFactory("LPTokenTest");
    lpToken = await factoryLPToken.deploy(ethers.BigNumber.from("2000000000000000000000")); //2000
    await lpToken.deployed();

    //создаем мои
    const factoryMyToken = await ethers.getContractFactory("MyTokenTest");
    myToken = await factoryMyToken.deploy(ethers.BigNumber.from("3000000000000000000000")); //3000
    await myToken.deployed();

    const factoryStake = await ethers.getContractFactory("StakeLPToken");
    //constructor(address _lpTokenAddr, address _rewardTokenAddr, address _admin)
    stake = await factoryStake.deploy(lpToken.address, myToken.address, owner.address);
    await stake.deployed();    
  });

  //18 нулей 000000000000000000 

  //beforeEach перед каждым it
 /* beforeEach(async function () {
    console.log("beforeEach");
  });*/

  it("Test unstake 'No LP tokens.'", async function () {
    //забрать  ЛП
    expect( stake.connect(addr1).unstake() ).to.be.revertedWith("No LP tokens."); 
  });

  it("Test Acces role", async function () {
    await stake.setMinStakeTime(60); //админ может
    await stake.setPercent(3);
    
    expect( stake.connect(addr1).setMinStakeTime(1000) ).to.be.revertedWith("Caller is not an admin"); 
    expect( stake.connect(addr1).setPercent(50) ).to.be.revertedWith("Caller is not an admin"); 
  });


  it("Test stake", async function () {
    /*console.log("owner:" + owner.address);
    console.log("addr1:" + addr1.address);
    console.log("addr2:" + addr2.address);*/

    // передаем аддр1 ЛП
    await lpToken.transfer(addr1.address, 2000);  
    expect(await lpToken.balanceOf(addr1.address)).to.equal(2000);  //баланс ЛП
    expect(await myToken.balanceOf(addr1.address)).to.equal(0);  //баланс Моего

    // передаем контраку Мои для награды
    await myToken.transfer(stake.address, 3000); 
    expect(await lpToken.balanceOf(stake.address)).to.equal(0);  //баланс ЛП
    expect(await myToken.balanceOf(stake.address)).to.equal(3000);  //баланс Моего


    // разрешаем контракту списать N токенов
    await lpToken.connect(addr1).approve(stake.address, 2000);
    expect(await lpToken.allowance(addr1.address, stake.address)).to.equal(2000);  //разрешено 

    //положить токены
    await stake.connect(addr1).stake(500);
    expect(await lpToken.balanceOf(stake.address)).to.equal(500);  //баланс
    expect(await lpToken.balanceOf(addr1.address)).to.equal(1500);  //баланс

    //награда
    expect(  stake.connect(addr1).claim() ).to.be.revertedWith("No reward tokens."); 
  });

  it("Test unstake 'Wait more time.'", async function () {
    //забрать  ЛП
    expect( stake.connect(addr1).unstake() ).to.be.revertedWith("Wait more time."); 
    expect(await lpToken.balanceOf(stake.address)).to.equal(500);  //баланс
    expect(await lpToken.balanceOf(addr1.address)).to.equal(1500);  //баланс
  });

  it("Test claim 1", async function () {
    //подождать 70 секунд
    for (let i = 1; i <= 7; i++) {
      await new Promise(resolve => setTimeout(resolve, 10*1000));
      process.stdout.write(" " + (i * 10));
    }
  
    //награда = 3% за минуту от 500 
    await stake.connect(addr1).claim(); 
    expect(await myToken.balanceOf(addr1.address)).to.equal(500*3/100);  //баланс Моего    
  });

  it("Test claim 2", async function () {
    //подождать 70 секунд
    for (let i = 1; i <= 7; i++) {
      await new Promise(resolve => setTimeout(resolve, 10*1000));
      process.stdout.write(" " + (i * 10));
    }

    //награда = 3% за минуту от 500 (*2 - т.к. уже забрали)
    await stake.connect(addr1).claim(); 
    expect(await myToken.balanceOf(addr1.address)).to.equal(500*3/100 * 2);  //баланс Моего
  });

  it("Test unstake", async function () {
    //забрать  ЛП
    await stake.connect(addr1).unstake();
    expect(await lpToken.balanceOf(stake.address)).to.equal(0);  //баланс
    expect(await lpToken.balanceOf(addr1.address)).to.equal(2000);  //баланс ЛП
  });

});
