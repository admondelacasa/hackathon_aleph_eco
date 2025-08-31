// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ContractFeedback is Ownable {
    struct Review {
        uint256 contractId;
        address reviewer;
        address reviewee;
        uint8 rating; // 1-5 stars
        string comment;
        uint256 timestamp;
        bool isClient; // true if client reviewing contractor, false if contractor reviewing client
        bool verified; // if the review is verified by BuildTrust
    }

    struct ContractorProfile {
        address contractorAddress;
        string name;
        string description;
        string[] skills;
        string[] certifications; // professional certifications
        uint256 totalContracts;
        uint256 completedContracts;
        uint256 disputedContracts;
        uint256 totalRating;
        uint256 reviewCount;
        bool isVerified;
        uint256 reputationScore; // calculated based on reviews, completed contracts, and disputes
        uint256 joinedAt; // timestamp when contractor joined platform
    }

    mapping(uint256 => Review[]) public contractReviews;
    mapping(address => ContractorProfile) public contractorProfiles;
    mapping(address => uint256[]) public contractorReviewIds;
    mapping(address => uint256[]) public clientReviewIds;
    mapping(uint256 => mapping(address => bool)) public hasReviewed;

    address public escrowContract;
    uint256 public nextReviewId = 1;

    event ReviewSubmitted(uint256 indexed contractId, address indexed reviewer, address indexed reviewee, uint8 rating);
    event ContractorRegistered(address indexed contractor, string name);
    event ContractorVerified(address indexed contractor);

    modifier onlyEscrowContract() {
        require(msg.sender == escrowContract, "Only escrow contract can call this");
        _;
    }

    constructor(address _escrowContract) {
        escrowContract = _escrowContract;
    }

    function registerContractor(
        string memory _name,
        string memory _description,
        string[] memory _skills
    ) external {
        require(bytes(_name).length > 0, "Name required");
        require(_skills.length > 0, "At least one skill required");

        contractorProfiles[msg.sender] = ContractorProfile({
            contractorAddress: msg.sender,
            name: _name,
            description: _description,
            skills: _skills,
            totalContracts: 0,
            completedContracts: 0,
            totalRating: 0,
            reviewCount: 0,
            isVerified: false
        });

        emit ContractorRegistered(msg.sender, _name);
    }

    function submitReview(
        uint256 contractId,
        address reviewee,
        uint8 rating,
        string memory comment,
        bool isClient
    ) external {
        require(rating >= 1 && rating <= 5, "Rating must be 1-5");
        require(bytes(comment).length > 0, "Comment required");
        require(!hasReviewed[contractId][msg.sender], "Already reviewed this contract");

        Review memory newReview = Review({
            contractId: contractId,
            reviewer: msg.sender,
            reviewee: reviewee,
            rating: rating,
            comment: comment,
            timestamp: block.timestamp,
            isClient: isClient
        });

        contractReviews[contractId].push(newReview);
        hasReviewed[contractId][msg.sender] = true;

        if (isClient) {
            // Client reviewing contractor
            contractorReviewIds[reviewee].push(nextReviewId);
            ContractorProfile storage profile = contractorProfiles[reviewee];
            profile.totalRating += rating;
            profile.reviewCount++;
        } else {
            // Contractor reviewing client
            clientReviewIds[reviewee].push(nextReviewId);
        }

        nextReviewId++;
        emit ReviewSubmitted(contractId, msg.sender, reviewee, rating);
    }

    function updateJobStats(address contractor, bool completed) external onlyEscrowContract {
        ContractorProfile storage profile = contractorProfiles[contractor];
        profile.totalContracts++;
        if (completed) {
            profile.completedContracts++;
        }
    }

    function verifyContractor(address contractor) external onlyOwner {
        require(contractorProfiles[contractor].contractorAddress != address(0), "Contractor not registered");
        contractorProfiles[contractor].isVerified = true;
        emit ContractorVerified(contractor);
    }

    function getContractorRating(address contractor) external view returns (uint256) {
        ContractorProfile memory profile = contractorProfiles[contractor];
        if (profile.reviewCount == 0) return 0;
        return (profile.totalRating * 100) / profile.reviewCount; // Returns rating * 100 for precision
    }

    function getContractReviews(uint256 contractId) external view returns (Review[] memory) {
        return contractReviews[contractId];
    }

    function getContractorProfile(address contractor) external view returns (ContractorProfile memory) {
        return contractorProfiles[contractor];
    }

    function setEscrowContract(address _escrowContract) external onlyOwner {
        escrowContract = _escrowContract;
    }
}
