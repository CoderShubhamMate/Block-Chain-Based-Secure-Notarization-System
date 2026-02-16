// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title BBSNSMultiSig
 * @notice Professional execution-only Multi-Sig wallet for BBSNS Governance.
 * @dev Handles on-chain execution of administrative actions once M-of-N threshold is met.
 * Features: Timelock, Signer Rotation, and threshold management.
 */
contract BBSNSMultiSig is ReentrancyGuard, EIP712 {
    using ECDSA for bytes32;
    event TransactionSubmitted(uint256 indexed txIndex, address indexed proposer, address indexed to, uint256 value, bytes data, bytes32 proposalHash);
    event TransactionConfirmed(uint256 indexed txIndex, address indexed confirmer);
    event TransactionRevoked(uint256 indexed txIndex, address indexed revoker);
    event TransactionExecuted(uint256 indexed txIndex, address indexed executor, address indexed to, uint256 value);
    event SignerAdded(address indexed newSigner);
    event SignerRemoved(address indexed oldSigner);
    event ThresholdChanged(uint256 newThreshold);
    event TimelockChanged(uint256 newDelay);

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 numConfirmations;
        uint256 submissionTime;
        uint256 signerVersion; // Invalidate confirmations if signers rotate
        bytes32 proposalHash;
    }

    address[] public signers;
    mapping(address => bool) public isSigner;
    uint256 public threshold;
    uint256 public timelockDelay; 
    uint256 public signerVersion; // Incremented on any signer or threshold change

    Transaction[] public transactions;
    // txIndex => signer => confirmed
    mapping(uint256 => mapping(address => bool)) public isConfirmed;

    modifier onlySelf() {
        require(msg.sender == address(this), "MultiSig: Only self-call allowed");
        _;
    }

    modifier onlySigner() {
        require(isSigner[msg.sender], "MultiSig: Not a signer");
        _;
    }

    modifier txExists(uint256 _txIndex) {
        require(_txIndex < transactions.length, "MultiSig: Transaction does not exist");
        _;
    }

    modifier notExecuted(uint256 _txIndex) {
        require(!transactions[_txIndex].executed, "MultiSig: Transaction already executed");
        _;
    }

    modifier notConfirmed(uint256 _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "MultiSig: Transaction already confirmed");
        _;
    }

    constructor(address[] memory _signers, uint256 _threshold, uint256 _timelockDelay) EIP712("BBSNS_Protocol", "2") {
        require(_signers.length > 0, "MultiSig: Signers required");
        require(_threshold > 0 && _threshold <= _signers.length, "MultiSig: Invalid threshold");

        for (uint256 i = 0; i < _signers.length; i++) {
            address signer = _signers[i];
            require(signer != address(0), "MultiSig: Invalid signer address");
            require(!isSigner[signer], "MultiSig: Signer not unique");

            isSigner[signer] = true;
            signers.push(signer);
        }

        threshold = _threshold;
        timelockDelay = _timelockDelay;
        signerVersion = 1;
    }

    /**
     * @notice Submits a new transaction for approval.
     */
    function submitTransaction(address _to, uint256 _value, bytes memory _data, bytes32 _proposalHash) public onlySigner {
        require(_to != address(0), "MultiSig: Invalid target address");
        uint256 txIndex = transactions.length;

        transactions.push(Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false,
            numConfirmations: 0,
            submissionTime: block.timestamp,
            signerVersion: signerVersion,
            proposalHash: _proposalHash
        }));

        emit TransactionSubmitted(txIndex, msg.sender, _to, _value, _data, _proposalHash);
        
        // Auto-confirm for the proposer
        confirmTransaction(txIndex);
    }

    /**
     * @notice Submits a transaction via EIP-712 signature (Relayer-friendly).
     */
    function submitWithSignature(
        address _to, 
        uint256 _value, 
        bytes calldata _data, 
        bytes calldata _signature,
        bytes32 _proposalHash
    ) 
        external 
    {
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            keccak256("Submit(address to,uint256 value,bytes data,bytes32 proposalHash,uint256 version)"),
            _to,
            _value,
            keccak256(_data),
            _proposalHash,
            signerVersion
        )));
        
        address signer = digest.recover(_signature);
        require(isSigner[signer], "MultiSig: Invalid signer");

        uint256 txIndex = transactions.length;
        transactions.push(Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false,
            numConfirmations: 0,
            submissionTime: block.timestamp,
            signerVersion: signerVersion,
            proposalHash: _proposalHash
        }));

        emit TransactionSubmitted(txIndex, signer, _to, _value, _data, _proposalHash);
        
        // Auto-confirm for the proposer
        isConfirmed[txIndex][signer] = true;
        transactions[txIndex].numConfirmations = 1;
        emit TransactionConfirmed(txIndex, signer);
    }

    /**
     * @notice Confirms a pending transaction.
     */
    function confirmTransaction(uint256 _txIndex) 
        public 
        onlySigner 
        txExists(_txIndex) 
        notExecuted(_txIndex) 
        notConfirmed(_txIndex) 
    {
        Transaction storage transaction = transactions[_txIndex];
        require(transaction.signerVersion == signerVersion, "MultiSig: Signer set rotated since submission");

        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;

        emit TransactionConfirmed(_txIndex, msg.sender);
    }

    /**
     * @notice Revokes a previously cast confirmation.
     */
    function revokeConfirmation(uint256 _txIndex) 
        public 
        onlySigner 
        txExists(_txIndex) 
        notExecuted(_txIndex) 
    {
        require(isConfirmed[_txIndex][msg.sender], "MultiSig: Transaction not confirmed");

        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;

        emit TransactionRevoked(_txIndex, msg.sender);
    }

    /**
     * @notice Confirms a transaction via EIP-712 signature (Relayer-friendly).
     */
    function confirmWithSignature(uint256 _txIndex, bytes calldata _signature) 
        external 
        txExists(_txIndex) 
        notExecuted(_txIndex) 
    {
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            keccak256("Confirm(uint256 txIndex,uint256 version)"),
            _txIndex,
            signerVersion
        )));
        
        address signer = digest.recover(_signature);
        require(isSigner[signer], "MultiSig: Invalid signer");
        require(!isConfirmed[_txIndex][signer], "MultiSig: Already confirmed");
        
        Transaction storage transaction = transactions[_txIndex];
        require(transaction.signerVersion == signerVersion, "MultiSig: Signer rotated");

        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][signer] = true;

        emit TransactionConfirmed(_txIndex, signer);
    }

    /**
     * @notice Executes a transaction once threshold and timelock are met.
     */
    function executeTransaction(uint256 _txIndex) 
        public 
        onlySigner 
        txExists(_txIndex) 
        notExecuted(_txIndex) 
        nonReentrant 
    {
        Transaction storage transaction = transactions[_txIndex];

        require(transaction.numConfirmations >= threshold, "MultiSig: Threshold not met");
        require(block.timestamp >= transaction.submissionTime + timelockDelay, "MultiSig: Timelock active");
        require(transaction.signerVersion == signerVersion, "MultiSig: Signer set rotated since submission");

        transaction.executed = true;

        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "MultiSig: Transaction execution failed");

        emit TransactionExecuted(_txIndex, msg.sender, transaction.to, transaction.value);
    }

    /**
     * @notice Rotates signers or changes threshold (Only via self-execution).
     */
    function addSigner(address _newSigner) public onlySelf {
        require(_newSigner != address(0), "MultiSig: Invalid address");
        require(!isSigner[_newSigner], "MultiSig: Address is already a signer");

        isSigner[_newSigner] = true;
        signers.push(_newSigner);
        signerVersion++;

        emit SignerAdded(_newSigner);
    }

    function removeSigner(address _oldSigner) public onlySelf {
        require(isSigner[_oldSigner], "MultiSig: Not a signer");
        require(signers.length - 1 >= threshold, "MultiSig: Breaking threshold guardrail");

        isSigner[_oldSigner] = false;
        for (uint256 i = 0; i < signers.length; i++) {
            if (signers[i] == _oldSigner) {
                signers[i] = signers[signers.length - 1];
                signers.pop();
                break;
            }
        }
        signerVersion++;

        emit SignerRemoved(_oldSigner);
    }

    function changeThreshold(uint256 _newThreshold) public onlySelf {
        require(_newThreshold > 0, "MultiSig: Threshold must be > 0");
        require(_newThreshold <= signers.length, "MultiSig: Threshold exceeds signer count");
        
        threshold = _newThreshold;
        signerVersion++;

        emit ThresholdChanged(_newThreshold);
    }

    function setTimelockDelay(uint256 _newDelay) public onlySelf {
        timelockDelay = _newDelay;
        signerVersion++; // Also invalidate if security parameters change
        emit TimelockChanged(_newDelay);
    }

    // --- Helper Functions ---

    function getSigners() public view returns (address[] memory) {
        return signers;
    }

    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }

    function getTransaction(uint256 _txIndex) public view returns (
        address to, 
        uint256 value, 
        bytes memory data, 
        bool executed, 
        uint256 numConfirmations, 
        uint256 submissionTime,
        uint256 txSignerVersion
    ) {
        Transaction storage txReq = transactions[_txIndex];
        return (
            txReq.to,
            txReq.value,
            txReq.data,
            txReq.executed,
            txReq.numConfirmations,
            txReq.submissionTime,
            txReq.signerVersion
        );
    }

    receive() external payable {}
}
