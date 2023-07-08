import { Goerli } from "@usedapp/core";

export const ROUTER_ADDRESS = "0x50fd17CB77C4D1d228Ff6fE2da2bd5ddDa6Eb1D9";

export const DAPP_CONFIG = {
  readOnlyChainId: Goerli.chainId,
  readOnlyUrls: {
    [Goerli.chainId]:
      "https://eth-goerli.g.alchemy.com/v2/Vcw0foEvMXmzMfvIFh-N-G7hoWxaT3o1",
  },
};
