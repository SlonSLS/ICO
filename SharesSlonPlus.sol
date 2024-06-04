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
    string public name = "Shares Slon+";
    string public symbol = "SLS+";
    uint8 public decimals = 18;
    uint public _totalSupply = 560000000;
    uint256 public TokenPrice = 1e18; // 1 USD in wei (18 decimal places)
    address public creator;

    mapping(address => uint) balances;
    mapping(address => mapping(address => uint)) allowed;

    constructor () {
        creator = msg.sender;
        balances[creator] = _totalSupply;
        emit Transfer(address(0), creator, _totalSupply);
    }

    function totalSupply() public view override returns (uint) {
        return _totalSupply - balances[address(0)];
    }

    function balanceOf(address tokenOwner) public view override returns (uint balance) {
        return balances[tokenOwner];
    }

    function transfer(address to, uint tokens) public override returns (bool success) {
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
        uint256 amount = msg.value / TokenPrice;
        require(amount > 0, "You need to send some ether");
        require(amount <= balances[address(this)], "Insufficient balance");
        balances[address(this)] -= amount;
        balances[msg.sender] += amount;
        emit Transfer(address(this), msg.sender, amount);
    }

    function sellTokens(uint256 amount) public {
        require(amount > 0, "You need to sell at least one token");
        require(amount <= balances[msg.sender], "Insufficient balance");
        uint256 etherAmount = amount * TokenPrice;
        balances[msg.sender] -= amount;
        balances[address(this)] += amount;
        payable(msg.sender).transfer(etherAmount);
        emit Transfer(msg.sender, address(this), amount);
    }
}
