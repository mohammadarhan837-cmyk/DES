const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("DEPLOYER:", deployer.address);

  const Escrow = await hre.ethers.getContractFactory("Escrow");

  const freelancerAddress = "0x13A971266830990fF088E92D418e2c623cF16d42";

  const escrow = await Escrow.deploy(freelancerAddress, {
    value: hre.ethers.utils.parseEther("0.00001")
  });

  await escrow.deployed();

  console.log("Escrow deployed to:", escrow.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });