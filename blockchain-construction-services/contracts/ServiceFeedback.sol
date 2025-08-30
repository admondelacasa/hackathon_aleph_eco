// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ServiceFeedback is Ownable {
    struct Review {
        uint256 serviceId;
        address reviewer;
        address reviewee;
        uint8 rating; // 1-5 stars
        string comment;
        uint256 timestamp;
        bool isClient; // true if client reviewing contractor, false if contractor reviewing client
    }

    struct ContractorProfile {
        address contractorAddress;
        string name;
        string description;
        string[] skills;
        uint256 totalJobs;
        uint256 completedJobs;
        uint256 totalRating;
        uint256 reviewCount;
        bool isVerified;
    }

    mapping(uint256 => Review[]) public serviceReviews;
    mapping(address => ContractorProfile) public contractorProfiles;
    mapping(address => uint256[]) public contractorReviews;
    mapping(address => uint256[]) public clientReviews;
    mapping(uint256 => mapping(address => bool)) public hasReviewed;

    address public escrowContract;
    uint256 public nextReviewId = 1;

    event ReviewSubmitted(uint256 indexed serviceId, address indexed reviewer, address indexed reviewee, uint8 rating);
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
            totalJobs: 0,
            completedJobs: 0,
            totalRating: 0,
            reviewCount: 0,
            isVerified: false
        });

        emit ContractorRegistered(msg.sender, _name);
    }

    function submitReview(
        uint256 serviceId,
        address reviewee,
        uint8 rating,
        string memory comment,
        bool isClient
    ) external {
        require(rating >= 1 && rating <= 5, "Rating must be 1-5");
        require(bytes(comment).length > 0, "Comment required");
        require(!hasReviewed[serviceId][msg.sender], "Already reviewed this service");

        Review memory newReview = Review({
            serviceId: serviceId,
            reviewer: msg.sender,
            reviewee: reviewee,
            rating: rating,
            comment: comment,
            timestamp: block.timestamp,
            isClient: isClient
        });

        serviceReviews[serviceId].push(newReview);
        hasReviewed[serviceId][msg.sender] = true;

        if (isClient) {
            // Client reviewing contractor
            contractorReviews[reviewee].push(nextReviewId);
            ContractorProfile storage profile = contractorProfiles[reviewee];
            profile.totalRating += rating;
            profile.reviewCount++;
        } else {
            // Contractor reviewing client
            clientReviews[reviewee].push(nextReviewId);
        }

        nextReviewId++;
        emit ReviewSubmitted(serviceId, msg.sender, reviewee, rating);
    }

    function updateJobStats(address contractor, bool completed) external onlyEscrowContract {
        ContractorProfile storage profile = contractorProfiles[contractor];
        profile.totalJobs++;
        if (completed) {
            profile.completedJobs++;
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

    function getServiceReviews(uint256 serviceId) external view returns (Review[] memory) {
        return serviceReviews[serviceId];
    }

    function getContractorProfile(address contractor) external view returns (ContractorProfile memory) {
        return contractorProfiles[contractor];
    }

    function setEscrowContract(address _escrowContract) external onlyOwner {
        escrowContract = _escrowContract;
    }
}
