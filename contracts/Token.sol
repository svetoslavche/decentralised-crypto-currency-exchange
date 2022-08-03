//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol"; 

contract Token {
	string public name;
	string public symbol;
	uint256 public decimals = 18; // Leave the decimals hardcoded because having 18 is universal for ERC-20
	uint256 public totalSupply; 

	mapping (address => uint256) public balanceOf; 	// Track balances

	event Transfer(
		address indexed from, 
		address indexed to, 
		uint256 value
	);

	constructor(
		string memory _name, 
		string memory _symbol, 
		uint256 _totalSupply
	) { // Make the token easily configurable (name,symbol etc.) so that we can create multiple tokens
		name = _name;
		symbol = _symbol;
		totalSupply = _totalSupply * (10**decimals); // 1,000,000 x 10^18
		balanceOf[msg.sender] = totalSupply; // Write info to the mapping - Assign all the tokens to the address that has deployed the smart contract
	}  

	function transfer(address _to, uint256 _value) // Send tokens
		public 
		returns (bool success) 
	{ 	
		require(balanceOf[msg.sender] >= _value); // Require that sender has enough tokens to spend
		require(_to != address(0)); // and it is the correct address

		balanceOf[msg.sender] = balanceOf[msg.sender] - _value; // Deduct tokens from spender
		balanceOf[_to] = balanceOf[_to] + _value; // Credit tokens to receiver

		emit Transfer(msg.sender, _to, _value); // Emit event

		return true;
	} 
}
