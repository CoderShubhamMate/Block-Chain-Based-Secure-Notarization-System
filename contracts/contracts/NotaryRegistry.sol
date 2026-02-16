// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NotaryRegistry
 * @notice On-chain registry of authorized Notaries for BBSNS.
 * @dev Controlled by BBSNSMultiSig. Stores rich metadata for forensic auditing.
 */
contract NotaryRegistry is Ownable {
    event NotaryAdded(address indexed notary, uint256 timestamp, address indexed addedBy);
    event NotaryRemoved(address indexed notary, uint256 timestamp, address indexed removedBy);

    struct Notary {
        bool active;
        uint256 addedAt;
        address addedBy;
    }

    mapping(address => Notary) public notaries;
    address[] public notaryList;

    constructor(address _multiSigOwner) Ownable(_multiSigOwner) {}

    /**
     * @notice Authorizes a new notary.
     * @param _notary The wallet address of the notary.
     */
    function addNotary(address _notary) external onlyOwner {
        require(_notary != address(0), "NotaryRegistry: Invalid address");
        require(!notaries[_notary].active, "NotaryRegistry: Notary already active");

        notaries[_notary] = Notary({
            active: true,
            addedAt: block.timestamp,
            addedBy: msg.sender
        });
        notaryList.push(_notary);

        emit NotaryAdded(_notary, block.timestamp, msg.sender);
    }

    /**
     * @notice Revokes notary authorization.
     * @param _notary The wallet address of the notary to remove.
     */
    function removeNotary(address _notary) external onlyOwner {
        require(notaries[_notary].active, "NotaryRegistry: Notary not active");

        notaries[_notary].active = false;

        emit NotaryRemoved(_notary, block.timestamp, msg.sender);
    }

    /**
     * @notice Checks if an address is an active authorized notary.
     * @param _notary The address to check.
     */
    function isNotary(address _notary) external view returns (bool) {
        return notaries[_notary].active;
    }

    /**
     * @notice Returns the metadata for a specific notary.
     */
    function getNotary(address _notary) external view returns (bool active, uint256 addedAt, address addedBy) {
        Notary memory n = notaries[_notary];
        return (n.active, n.addedAt, n.addedBy);
    }

    /**
     * @notice Returns the total number of authorized notaries (including inactive).
     */
    function getNotaryCount() external view returns (uint256) {
        return notaryList.length;
    }
}
