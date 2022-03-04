// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";

interface IERC20 {
    function transfer(address _to, uint256 _amount) external returns (bool);

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) external returns (bool);

    //function approve(address _spender, uint256 _value) external returns (bool);
}

contract StakeLPToken is AccessControl {
    struct Balance {
        uint256 amount; //баланс
        uint256 stakeTime; //время стейкинга
        uint256 clameTime; //время запроса вознаграждения
    }

    //хранение баланса
    mapping(address => Balance) private mBalance;

    //это адрес LP токена
    //address private lpTokenAddr = 0xE41945b3008a3Ea0272bDD4C52B2F5Af55eE1b41;
    IERC20 private mLpToken; // = IERC20(lpTokenAddr);
    IERC20 private mRewardToken;

    uint256 private mMinStakeTime;
    uint256 private mPercent;

    //роль админа
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    //конструктор получает адреса LP токенов и reward (ERC20Dima)
    constructor(address _lpTokenAddr, address _rewardTokenAddr, address _admin) {
        mLpToken = IERC20(_lpTokenAddr);
        mRewardToken = IERC20(_rewardTokenAddr);

        mMinStakeTime = 10 seconds;
        mPercent = 2; //2% за минуту

        // роль админа
        _grantRole(ADMIN_ROLE, _admin);
    }

    // stake(uint256 amount) - списывает с пользователя на контракт стейкинга ЛП токены в количестве amount, обновляет в контракте баланс пользователя
    function stake(uint256 _amount) public {
        //получаем текущий баланс
        Balance memory curBalance = mBalance[msg.sender];
        curBalance.amount += _amount; //сумму прибавляем
        curBalance.stakeTime = block.timestamp; //а время перезаписываем для простоты
        mBalance[msg.sender] = curBalance;
        
        console.log("stake.  curBalance.stakeTime:", curBalance.stakeTime);

        //передаем ЛП токены c пользователя на этот контракт
        mLpToken.transferFrom(msg.sender, address(this), _amount);
    }

    // claim() - списывает с контракта стейкинга ревард токены доступные в качестве наград
    function claim() public {
        uint256 rewardBalance;
        Balance memory curBalance = mBalance[msg.sender];

        //время для начала расчета вознаграждения (если ранее уже запрашивали)
        uint256 clameTimeStart;
        if (curBalance.clameTime != 0) {
            clameTimeStart = curBalance.clameTime;
        } else {
            clameTimeStart = curBalance.stakeTime;
        }

        //сколько минут  хранится
        uint256 stakeTime = (block.timestamp - clameTimeStart) / 60;

        //за каждую 1 минуту 2 процента от баланса ЛП токенов
        rewardBalance = (stakeTime * curBalance.amount * mPercent) / 100;
        require(rewardBalance > 0, "No reward tokens.");

        //обновляем время вознаграждения
        curBalance.clameTime = block.timestamp;
        mBalance[msg.sender] = curBalance;

        mRewardToken.transfer(msg.sender, rewardBalance);
    }

    // unstake() - списывает с контракта стейкинга ЛП токены доступные для вывода
    function unstake() public {
        Balance memory curBalance = mBalance[msg.sender];
        uint256 balanceToUnstake = curBalance.amount;
        require(balanceToUnstake > 0, "No LP tokens.");

        //Вывести застейканные ЛП токены также можно после определенного времени
        console.log("unstake.  block.timestamp:", block.timestamp);
        require(
            curBalance.stakeTime + mMinStakeTime < block.timestamp,
            "Wait more time."
        );

        //обнуляем баланс пользователя
        curBalance.amount = 0;
        mBalance[msg.sender] = curBalance;

        //возвращаем ЛП токены
        mLpToken.transfer(msg.sender, balanceToUnstake);
    }

    //- Функции админа для изменения параметров стейкинга (время заморозки, процент), с AccessControl
    function setMinStakeTime(uint _minStakeTime) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not an admin");
        mMinStakeTime = _minStakeTime;
    }
    function setPercent(uint _percent) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not an admin");
        mPercent = _percent;
    }
}
