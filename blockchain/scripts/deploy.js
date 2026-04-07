const hre = require("hardhat");

async function main() {

  const Escrow = await hre.ethers.getContractFactory("Escrow");

  const freelancerAddress = "0x0000000000000000000000000000000000000001";

  const escrow = await Escrow.deploy(freelancerAddress, {
    value: hre.ethers.utils.parseEther("0.001")
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