import { abis } from "@my-app/contracts";

export const getPairsInfo = async (pairAddresses, web3) => {
  const pairsInfo = [];
  const pairAbi = abis.pair;
  const tokenAbi = abis.erc20.abi;
  for (let i = 0; i < pairAddresses.length; i++) {
    const pairAddress = pairAddresses[i];
    const pair = new web3.eth.Contract(pairAbi, pairAddress);
    const token0address = await pair.methods.token0().call();
    const token1address = await pair.methods.token1().call();
    const token0contract = new web3.eth.Contract(tokenAbi, token0address);
    const token1contract = new web3.eth.Contract(tokenAbi, token1address);
    const token0name = await token0contract.methods.name().call();
    const token1name = await token1contract.methods.name().call();
    pairsInfo.push({
      address: pairAddress,
      token0address: token0address,
      token1address: token1address,
      token0name: token0name,
      token1name: token1name,
    });
  }
  return pairsInfo;
};
