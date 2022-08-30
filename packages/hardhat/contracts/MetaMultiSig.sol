pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract MetaMultiSig {
  using ECDSA for bytes32; 

  mapping(address => bool) public isSigner;
  address[] public signers;
  uint256 public signaturesRequired;
  uint256 public nonce;
  uint256 public chainId;

  event Signer(address signer, string _message);
  event SignaturesRequired(address readContract, uint256 newSignaturesRequired);
  event Withdraw(address to, uint256 _eth);
  event Deposit(address from, uint256 _eth);

  modifier onlySelf() {
    require(msg.sender == address(this), "Not Self");
    _;
  }

  constructor(uint256 _chainId, address[] memory _signers, uint256 _signaturesRequired) {
    require(_signaturesRequired > 0, "constructor(): at least one signature required");
    signaturesRequired = _signaturesRequired;
    for (uint i = 0; i < _signers.length; i++) {
      address signer = _signers[i];
      require(signer != address(0), "constructor(): must be non-zero address");
      require(!isSigner[signer], "constructor(): signer already registered");
      isSigner[signer] = true;
      signers.push(signer);
    }
    chainId = _chainId;
  }

  function addSigner(address newSigner) public onlySelf {
    require(newSigner != address(0), "addSigner(): must be non-zero address");
    require(!isSigner[newSigner], "addSigner(): signer already registered");
    isSigner[newSigner] = true;
    signers.push(newSigner);
    emit Signer(newSigner, "Added");
  }

  function removeSigner(address signer) public onlySelf {
    require(signer != address(0), "removeSigner(): must be non-zero address");
    require(isSigner[signer], "removeSigner(): signer must be registered");
    isSigner[signer] = false;
    uint index;
    for (uint i = 0; i < signers.length; i++) {
      if (signers[i] == signer) index = i;
    }
    for (uint i = index; i < signers.length - 1; i++) {
      signers[i] = signers[i + 1];
    }
    signers.pop();
    emit Signer(signer, "Removed");
  }

  function updateSignaturesRequired(uint256 newSignaturesRequired) public onlySelf {
    require(newSignaturesRequired > 0, "updateSignaturesRequired(): at least one signature required");
    require(newSignaturesRequired <= signers.length, "updateSignaturesRequired(): not enough number of signers");
    signaturesRequired = newSignaturesRequired;
    emit SignaturesRequired(address(this), newSignaturesRequired);
  }

  function execute(address payable to, uint256 value, bytes memory data, bytes[] memory signatures ) public returns (bytes memory) {
    require(isSigner[msg.sender], "Only signers can execute");
    bytes32 _hash = getTransactionHash(nonce, to, value, data);
    uint256 validSignatures;
    address duplicateGuard;
    for (uint i = 0; i < signatures.length; i++) {
      address recovered = recover(_hash, signatures[i]);
      require(recovered > duplicateGuard, "executeTransaction: duplicate or unordered signatures");
      require(isSigner[recovered], "executeTransaction: invalid signature");
      duplicateGuard = recovered;
      validSignatures++;
    }
    require(validSignatures >= signaturesRequired, "executeTransaction: not enough valid signatures");
    
    (bool success, bytes memory result) = to.call{value: value}(data);
    require(success, "executeTransaction: tx failed");
    nonce++;
    if (to != address(this)) emit Withdraw(to, value);
    return result;
  }

  function getTransactionHash(uint256 _nonce, address to, uint256 value, bytes memory data) public view returns (bytes32) {
    return keccak256(abi.encodePacked(address(this), chainId, _nonce, to, value, data));
  }

  function recover(bytes32 _hash, bytes memory _signature) public pure returns (address) {
    return _hash.toEthSignedMessageHash().recover(_signature);
  }
  
  function getSigners() public view returns (address[] memory) {
    return signers;
  }

  // to support receiving ETH by default
  receive() external payable {
    emit Deposit(msg.sender, msg.value);
  }
  fallback() external payable {}
}
