import React from "react";
import styles from "./styles";
import { useEthers } from "@usedapp/core";
import { uniswapLogo } from "./assets";
import { Exchange, Loader, WalletButton } from "./components";
import { usePools } from "./hooks";
const App = () => {
  const { account } = useEthers();
  const [loading, pools] = usePools();
  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <header className={styles.header}>
          <img
            src={uniswapLogo}
            alt="uniswap logo"
            className="w-16 h-16 object-contain"
          ></img>
          <WalletButton />
        </header>
        <div className={styles.exchangeContainer}>
          <h1 className={styles.headTitle}>Exchange Tokens in seconds</h1>
          <p className={styles.subTitle}>Built on top of Uniswap 2.0</p>
          <div className={styles.exchangeBoxWrapper}>
            <div className={styles.exchangeBox}>
              <div className="pink_gradient" />
              <div className={styles.exchange}>
                {account ? (
                  loading ? (
                    <Loader title="Loading Pools, please wait.." />
                  ) : (
                    <Exchange pools={pools} />
                  )
                ) : (
                  <Loader title="Please connect your wallet!" />
                )}
              </div>
              <div className="blue_gradient" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
