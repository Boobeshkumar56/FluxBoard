const hre = require("hardhat");

async function main() {
  const FluxBoard = await hre.ethers.getContractFactory("FluxBoard");
  const fluxBoard = await FluxBoard.deploy(); // deploy returns a promise

  await fluxBoard.waitForDeployment(); // ⬅️ this replaces `.deployed()`

  console.log("✅ FluxBoard deployed to:", await fluxBoard.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
