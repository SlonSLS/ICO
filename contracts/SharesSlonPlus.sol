pragma solidity ^0.8.20;

interface TRC20 {
    function totalSupply() external view returns (uint);
    function balanceOf(address tokenOwner) external view returns (uint balance);
    function allowance(address tokenOwner, address spender) external view returns (uint remaining);
    function transfer(address to, uint tokens) external returns (bool success);
    function approve(address spender, uint tokens) external returns (bool success);
    function transferFrom(address from, address to, uint tokens) external returns (bool success);

    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}

contract SharesSlonPlus is TRC20 {
    string public name = "Shares SlonPlus";
    string public symbol = "SLS+";
    uint8 public decimals = 18;
    uint public _totalSupply = 560000000 * 10**uint(decimals);
    uint256 public TokenPrice = 1e18; // 1 USD in wei (18 decimal places)
    address public owner;
    address public newOwner;
    bool public paused = false;

    mapping(address => uint) balances;
    mapping(address => mapping(address => uint)) allowed;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor () {
        owner = msg.sender;
        balances[owner] = _totalSupply;
        emit Transfer(address(0), owner, _totalSupply);
    }

    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "New owner cannot be zero address");
        newOwner = _newOwner;
    }

    function acceptOwnership() public {
        require(msg.sender == newOwner, "Only the new owner can accept ownership");
        owner = newOwner;
        newOwner = address(0);
    }

    function totalSupply() public view override returns (uint) {
        return _totalSupply - balances[address(0)];
    }

    function balanceOf(address tokenOwner) public view override returns (uint balance) {
        return balances[tokenOwner];
    }

    function transfer(address to, uint tokens) public override returns (bool success) {
        require(to != address(0), "Cannot transfer to the zero address");
        require(balances[msg.sender] >= tokens, "Insufficient balance");
        balances[msg.sender] -= tokens;
        balances[to] += tokens;
        emit Transfer(msg.sender, to, tokens);
        return true;
    }

    function approve(address spender, uint tokens) public override returns (bool success) {
        allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }

    function transferFrom(address from, address to, uint tokens) public override returns (bool success) {
        require(to != address(0), "Cannot transfer to the zero address");
        require(balances[from] >= tokens, "Insufficient balance");
        require(allowed[from][msg.sender] >= tokens, "Insufficient allowance");
        balances[from] -= tokens;
        allowed[from][msg.sender] -= tokens;
        balances[to] += tokens;
        emit Transfer(from, to, tokens);
        return true;
    }

    function allowance(address tokenOwner, address spender) public view override returns (uint remaining) {
        return allowed[tokenOwner][spender];
    }

    function buyTokens() public payable {
        require(!paused, "Contract is paused");
        uint256 amount = msg.value / TokenPrice;
        require(amount > 0, "You need to send some ether");
        require(amount <= balances[owner], "Insufficient balance in the contract");
        balances[owner] -= amount;
        balances[msg.sender] += amount;
        emit Transfer(owner, msg.sender, amount);
    }

    function sellTokens(uint256 amount) public {
        require(!paused, "Contract is paused");
        require(amount > 0, "You need to sell at least one token");
        require(amount <= balances[msg.sender], "Insufficient balance");
        uint256 etherAmount = amount * TokenPrice;
        balances[msg.sender] -= amount;
        balances[owner] += amount;

        // Using call instead of transfer
        (bool success, ) = msg.sender.call{value: etherAmount}("");
        require(success, "Transfer failed.");

        emit Transfer(msg.sender, owner, amount);
    }

    function pause() public onlyOwner {
        paused = true;
    }

    function unpause() public onlyOwner {
        paused = false;
    }

    // Fallback function to handle ether sent to the contract
    receive() external payable {
        // Custom logic for receiving ether can be added here
    }
}
