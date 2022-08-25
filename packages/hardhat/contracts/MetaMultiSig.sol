pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract MetaMultiSig {
  using ECDSA for bytes32; 

  mapping(address => bool) public isSigner;
  uint public signaturesRequired;
  uint public signers;
  uint public nonce;
  uint public chainId;

  constructor(uint256 _chainId, address[] memory _signers, uint256 _signaturesRequired) {
    require(_signaturesRequired > 0, "constructor(): at least one signature required");
    signaturesRequired = _signaturesRequired;
    for (uint i = 0; i < _signers.length; i++) {
      address signer = _signers[i];
      require(signer != address(0), "constructor(): must be non-zero address");
      require(!isSigner[signer], "constructor(): signer already registered");
      isSigner[signer] = true;
      signers++;
    }
    chainId = _chainId;
  }

  function addSigner(address newSigner) public {
    require(newSigner != address(0), "addSigner(): must be non-zero address");
    require(!isSigner[newSigner], "addSigner(): signer already registered");
    isSigner[newSigner] = true;
    signers++;
  }

  function removeSigner(address signer) public {
    require(signer != address(0), "removeSigner(): must be non-zero address");
    require(isSigner[signer], "removeSigner(): signer must be registered");
    isSigner[signer] = false;
    signers--;
  }

  function updateSignaturesRequired(uint newSignaturesRequired) public {
    require(newSignaturesRequired > 0, "updateSignaturesRequired(): at least one signature required");
    require(newSignaturesRequired <= signers, "updateSignaturesRequired(): not enough number of signers");
    signaturesRequired = newSignaturesRequired;
  }

  function execute(address payable to, uint256 value, bytes memory data) public {
    (bool success, bytes memory result) = to.call{value: value}(data);
    require(success, "executeTransaction: tx failed");
  }

  function getTransactionHash(uint256 _nonce, address to, uint256 value, bytes memory data) public view returns (bytes32) {
    return keccak256(abi.encodePacked(address(this), chainId, _nonce, to, value, data));
  }

  function recover(bytes32 _hash, bytes memory _signature) public pure returns (address) {
    return _hash.toEthSignedMessageHash().recover(_signature);
  }

  // to support receiving ETH by default
  receive() external payable {}
  fallback() external payable {}
}
