import { Contract, getAddress, ethers } from "ethers";
import FluxBoard from "../artifacts/contracts/FluxBoard.sol/FluxBoard.json"; // ✅ correct ABI import

const CONTRACT_ADDRESS = "0xe3945E71D5acc457254521513bb2CBf1c947025B"; // ✅ Your local Hardhat deployment address

export function getContract(providerOrSigner: ethers.Provider | ethers.Signer) {
  try {
    const sanitized = getAddress(CONTRACT_ADDRESS.trim());
    return new Contract(sanitized, FluxBoard.abi, providerOrSigner);
  } catch (err) {
    console.error("❌ Invalid Ethereum address format:", CONTRACT_ADDRESS);
    throw err;
  }
}
