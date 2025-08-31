// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UserRegistry
 * @dev Contract for managing user registration and public key storage
 */
contract UserRegistry is Ownable {
    
    struct UserProfile {
        string publicKey;       // User's public key for encryption
        string username;        // User's chosen username  
        string profileData;     // JSON string with profile information
        uint256 registeredAt;   // Registration timestamp
        bool isRegistered;      // Registration status
    }
    
    // Mapping from wallet address to user profile
    mapping(address => UserProfile) public users;
    
    // Mapping from username to wallet address (for unique usernames)
    mapping(string => address) public usernameToAddress;
    
    // Array to track all registered addresses
    address[] public registeredUsers;
    
    // Events
    event UserRegistered(
        address indexed userAddress, 
        string indexed username, 
        string publicKey,
        uint256 timestamp
    );
    
    event UserUpdated(
        address indexed userAddress,
        string indexed username,
        string publicKey,
        uint256 timestamp
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Register a new user with public key and profile data
     * @param _publicKey User's public key for encryption
     * @param _username Unique username
     * @param _profileData JSON string with profile information
     */
    function registerUser(
        string memory _publicKey,
        string memory _username,
        string memory _profileData
    ) external {
        require(bytes(_publicKey).length > 0, "Public key cannot be empty");
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(!users[msg.sender].isRegistered, "User already registered");
        require(usernameToAddress[_username] == address(0), "Username already taken");
        
        // Create user profile
        users[msg.sender] = UserProfile({
            publicKey: _publicKey,
            username: _username,
            profileData: _profileData,
            registeredAt: block.timestamp,
            isRegistered: true
        });
        
        // Map username to address
        usernameToAddress[_username] = msg.sender;
        
        // Add to registered users array
        registeredUsers.push(msg.sender);
        
        emit UserRegistered(msg.sender, _username, _publicKey, block.timestamp);
    }
    
    /**
     * @dev Update user profile data
     * @param _profileData New profile data
     */
    function updateProfile(string memory _profileData) external {
        require(users[msg.sender].isRegistered, "User not registered");
        
        users[msg.sender].profileData = _profileData;
        
        emit UserUpdated(
            msg.sender, 
            users[msg.sender].username, 
            users[msg.sender].publicKey, 
            block.timestamp
        );
    }
    
    /**
     * @dev Update user's public key
     * @param _publicKey New public key
     */
    function updatePublicKey(string memory _publicKey) external {
        require(users[msg.sender].isRegistered, "User not registered");
        require(bytes(_publicKey).length > 0, "Public key cannot be empty");
        
        users[msg.sender].publicKey = _publicKey;
        
        emit UserUpdated(
            msg.sender, 
            users[msg.sender].username, 
            _publicKey, 
            block.timestamp
        );
    }
    
    /**
     * @dev Check if a user is registered
     * @param _userAddress Address to check
     * @return bool Registration status
     */
    function isUserRegistered(address _userAddress) external view returns (bool) {
        return users[_userAddress].isRegistered;
    }
    
    /**
     * @dev Get user profile by address
     * @param _userAddress User's wallet address
     * @return UserProfile User's profile data
     */
    function getUserProfile(address _userAddress) external view returns (UserProfile memory) {
        require(users[_userAddress].isRegistered, "User not registered");
        return users[_userAddress];
    }
    
    /**
     * @dev Get user profile by username
     * @param _username Username to lookup
     * @return UserProfile User's profile data
     */
    function getUserProfileByUsername(string memory _username) external view returns (UserProfile memory) {
        address userAddress = usernameToAddress[_username];
        require(userAddress != address(0), "Username not found");
        return users[userAddress];
    }
    
    /**
     * @dev Get user's public key by address
     * @param _userAddress User's wallet address
     * @return string Public key
     */
    function getUserPublicKey(address _userAddress) external view returns (string memory) {
        require(users[_userAddress].isRegistered, "User not registered");
        return users[_userAddress].publicKey;
    }
    
    /**
     * @dev Get user's public key by username
     * @param _username Username to lookup
     * @return string Public key
     */
    function getUserPublicKeyByUsername(string memory _username) external view returns (string memory) {
        address userAddress = usernameToAddress[_username];
        require(userAddress != address(0), "Username not found");
        return users[userAddress].publicKey;
    }
    
    /**
     * @dev Get address by username
     * @param _username Username to lookup
     * @return address User's wallet address
     */
    function getAddressByUsername(string memory _username) external view returns (address) {
        address userAddress = usernameToAddress[_username];
        require(userAddress != address(0), "Username not found");
        return userAddress;
    }
    
    /**
     * @dev Get total number of registered users
     * @return uint256 Number of registered users
     */
    function getTotalUsers() external view returns (uint256) {
        return registeredUsers.length;
    }
    
    /**
     * @dev Get all registered user addresses
     * @return address[] Array of registered addresses
     */
    function getAllRegisteredUsers() external view returns (address[] memory) {
        return registeredUsers;
    }
    
    /**
     * @dev Get registered users in a range (for pagination)
     * @param _start Start index
     * @param _limit Maximum number of users to return
     * @return address[] Array of registered addresses
     */
    function getRegisteredUsers(uint256 _start, uint256 _limit) external view returns (address[] memory) {
        require(_start < registeredUsers.length, "Start index out of bounds");
        
        uint256 end = _start + _limit;
        if (end > registeredUsers.length) {
            end = registeredUsers.length;
        }
        
        address[] memory result = new address[](end - _start);
        for (uint256 i = _start; i < end; i++) {
            result[i - _start] = registeredUsers[i];
        }
        
        return result;
    }
}
