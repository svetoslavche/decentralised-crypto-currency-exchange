//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol"; 
import "./Token.sol";

contract Exchange {
	address public feeAccount; // State variable for the account that receives the exchange fees
	uint256 public feePercent; // State variable for percentage fees
	mapping(address => mapping (address => uint256)) public tokens; // Track how many tokens each user has on the exchange
	mapping(uint256 => _Order) public orders; // Order mapping
	uint256 public orderCount; //

	event Deposit( // Creating a deposit event so we can emit it later
	address token,
	address user,
	uint256 amount,
	uint256 balance
	); 
	event Withdraw( // Creating a withdraw event so we can emit it later
	address token,
	address user,
	uint256 amount,
	uint256 balance
	); 
	event Order ( // Creating an Order event so we can emit it later
		uint256 id, // Unique identifier for order
		address user, // User who made order
		address tokenGet, // Address of the token they receive
		uint256 amountGet, // Amount they receive
		address tokenGive, // Address of the token they give
		uint256 amountGive, // Amount they give
		uint256 timestamp // When order was created
	);

	struct _Order { 
		// Attributes of an order
		uint256 id; // Unique identifier for order
		address user; // User who made order
		address tokenGet; // Address of the token they receive
		uint256 amountGet; // Amount they receive
		address tokenGive; // Address of the token they give
		uint256 amountGive; // Amount they give
		uint256 timestamp; // When order was created
	} 

	constructor(address _feeAccount, uint256 _feePercent) {
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}

	// ------------------------
	// DEPOSIT & WITHDRAW TOKEN

	function depositToken(address _token, uint256 _amount) public {
		
		require(Token(_token).transferFrom(msg.sender, address(this), _amount)); // Transfer tokens to exchange (out of the user's wallet to the exchange)
		
		tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount; // Update user balance
		
		emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);  // Emit an event so we can see the entire history of deposits
	}

	function withdrawToken(address _token, uint256 _amount) public {
		
		require(tokens[_token][msg.sender] >= _amount); // Ensure user has enough tokens to withdraw
		
		Token(_token).transfer(msg.sender, _amount); // Transfer tokens to user (out of the exchange to user's wallet)

		tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount; // Update user balance

		emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);  // Emit an event so we can see the entire history of withdrawals

	}
	
	function balanceOf(address _token, address _user) // wrapper function that check the value out of a mapping
		public
		view
		returns (uint256)
	{
		return tokens[_token][_user];
	}

	// ------------------------
	// MAKE & CANCEL ORDERS
	function makeOrder(
		address _tokenGet, // Token Get (token they want to receive) - which and token and how much?
		uint256 _amountGet,
		address _tokenGive, // Token Give (token they want to spend) - which and token and how much?
		uint256 _amountGive
	) public {
		// Prevents orders if tokens aren't on exchange
		require(balanceOf(_tokenGive, msg.sender) >= _amountGive);


		// Instantiate a new order
		orderCount = orderCount + 1;
		orders[orderCount] = _Order(
			orderCount, // id 1, 2, 3...
			msg.sender, // user
			_tokenGet, 
			_amountGet,
			_tokenGive,
			_amountGive,
			block.timestamp // timestamp put on the blockchain
		);

		// Emit event
		emit Order(
			orderCount,
			msg.sender,
			_tokenGet,
			_amountGet,
			_tokenGive,
			_amountGive,
			block.timestamp
		);
	}

}
