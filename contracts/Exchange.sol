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
	mapping(uint256 => bool) public orderCancelled; // Cancel orders (true/false)
	mapping(uint256 => bool) public orderFilled; // Take out all filled orders

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
	event Cancel ( // Creating a Cancel event so we can emit it later
		uint256 id, // Unique identifier for order
		address user, // User who made order
		address tokenGet, // Address of the token they receive
		uint256 amountGet, // Amount they receive
		address tokenGive, // Address of the token they give
		uint256 amountGive, // Amount they give
		uint256 timestamp // When order was created
	);
	event Trade ( // Creating a Cancel event so we can emit it later
		uint256 id, // Unique identifier for order
		address user, // User takes the order
		address tokenGet, // Address of the token they receive
		uint256 amountGet, // Amount they receive
		address tokenGive, // Address of the token they give
		uint256 amountGive, // Amount they give
		address creator, //
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
	
	function balanceOf(address _token, address _user) // wrapper function that checks the value out of a mapping
		public
		view
		returns (uint256)
	{
		return tokens[_token][_user];
	}

	// ------------------------
	// MAKE & CANCEL ORDERS
	function makeOrder(
		address _tokenGet, // Token Get (which token they want to receive)
		uint256 _amountGet, // How much?
		address _tokenGive, // Token Give (which token they want to spend) 
		uint256 _amountGive // How much?
	) public {
		require(balanceOf(_tokenGive, msg.sender) >= _amountGive); // Prevents orders if tokens aren't on exchange
		
		orderCount ++; // Instantiate a new order
		orders[orderCount] = _Order(
			orderCount, // id 1, 2, 3...
			msg.sender, // user
			_tokenGet, 
			_amountGet,
			_tokenGive,
			_amountGive,
			block.timestamp // timestamp put on the blockchain
		);

		emit Order( // Emit Order event
			orderCount,
			msg.sender,
			_tokenGet,
			_amountGet,
			_tokenGive,
			_amountGive,
			block.timestamp
		);
	}

	function cancelOrder(uint256 _id) public {
		_Order storage _order = orders[_id]; // Fetch the order 

		require(address(_order.user) == msg.sender); // Ensure the caller of the function is the owner of the order

		require(_order.id == _id); // Order must exist	

		orderCancelled[_id] = true; // Cancel the order

		emit Cancel( // Emit Cancel event
			_order.id,
			msg.sender,
			_order.tokenGet,
			_order.amountGet,
			_order.tokenGive,
			_order.amountGive,
			block.timestamp
		);
	}

	// ------------------------
	// EXECUTING ORDERS

	function fillOrder(uint256 _id) public {
		// 1. Must be a valid orderId
		require(_id > 0 && _id <= orderCount, 'Order does not exist');
		// 2. Order can't be filled
		require(!orderFilled[_id]);
		// 3. Order can't be cancelled
		require(!orderCancelled[_id]); // if the order is cancelled then it won't run the code below, so we want the opposite and use '!' in front

		_Order storage _order = orders[_id]; // Fetch the order out of the storage from the _Order mapping 

		_trade( // Execute the trade
			_order.id,
			_order.user,
			_order.tokenGet,
			_order.amountGet,
			_order.tokenGive,
			_order.amountGive
		);

		orderFilled[_order.id] = true; // Mark order as filled .id because we're reading it directly off _order line 160

	}

	function _trade( // Passing the order into this internal _trade function
		uint256 _orderId,
		address _user,
		address _tokenGet,
		uint256 _amountGet,
		address _tokenGive,
		uint256 _amountGive
	) internal { // Implement all the business logic to do the swap
		// Fee is paid by the user who filled the order (msg.sender)
		// Fee is deducted from _amountGet
		uint256 _feeAmount = (_amountGet * feePercent) / 100;
		
		// Execute the trade
		// msg.sender is the user who filled the order, while _user is who created the order
		tokens[_tokenGet][msg.sender] =
			tokens[_tokenGet][msg.sender] -
			(_amountGet + _feeAmount);

		tokens[_tokenGet][_user] = tokens[_tokenGet][_user] + _amountGet;

		// Charge fees
		tokens[_tokenGet][feeAccount] =
			tokens[_tokenGet][feeAccount] +
			_feeAmount;

		tokens[_tokenGive][_user] = tokens[_tokenGive][_user] - _amountGive;
		tokens[_tokenGive][msg.sender] =
			tokens[_tokenGive][msg.sender] +
			_amountGive;

		emit Trade( // Emit Trade event
			_orderId,
			msg.sender, // user who makes the trade
			_tokenGet,
			_amountGet,
			_tokenGive,
			_amountGive,
			_user, // creator of the trade
			block.timestamp // when this happened
		);	
	}

}
