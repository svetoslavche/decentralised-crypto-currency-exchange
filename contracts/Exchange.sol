//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol"; 

contract Exchange {
	address public feeAccount; // State variable for the account that receives the exchange fees
	uint256 public feePercent; // State variable for percentage fees

	constructor(address _feeAccount, uint256 _feePercent) {
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}

}
