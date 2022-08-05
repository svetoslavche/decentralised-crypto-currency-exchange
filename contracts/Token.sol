//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol"; 

contract Token {
	string public name;
	string public symbol;
	uint256 public decimals = 18; // Leave the decimals hardcoded because having 18 is universal for ERC-20
	uint256 public totalSupply; 

	mapping(address => uint256) public balanceOf; // Track balances
	mapping(address => mapping(address => uint256)) public allowance; // Nested mapping for the allowance

	event Transfer(
		address indexed from, 
		address indexed to, 
		uint256 value
	);

	event Approval(
		address indexed owner, 
		address indexed spender, 
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

		_transfer(msg.sender, _to, _value);

		return true;
	} 

	function _transfer(
		address _from,
		address _to,
		uint256 _value
	) internal {
		require(_to != address(0)); // and it has the correct address

		balanceOf[_from] = balanceOf[_from] - _value; // Deduct tokens from address
		balanceOf[_to] = balanceOf[_to] + _value; // Credit tokens to address

		emit Transfer(_from, _to, _value); // Emit event
	}

	function approve(address _spender, uint256 _value) // Approve allowance
		public 
		returns(bool success) 
	{
		require(_spender != address(0)); 

		allowance[msg.sender][_spender] = _value;
		emit Approval(msg.sender, _spender, _value);
		return true;
	}

	function transferFrom(
		address _from, 
		address _to, 
		uint256 _value
	) 
		public 
		returns (bool success) 
	{
		require(_value <= balanceOf[_from]); // which is the same requirement as in the main function transfer but in reverse 
		require(_value <= allowance[_from][msg.sender]); // _from is the person who's authorizing the transfer, in this case the sender/deployer. // so we see their what allowance is and if the _value is less or equal then the condition will be met and execute the rest. if not, throw and error.

		allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value; // Reset allowance

		_transfer(_from, _to, _value); // Spend tokens

		return true;
	}


}
